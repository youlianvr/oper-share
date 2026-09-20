import "dotenv/config";
import { stringify } from "qs-esm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CMS_HOST = process.env.CMS_HOST;
const CMS_API_KEY = process.env.CMS_API_KEY;

if (!CMS_HOST || !CMS_API_KEY) {
  console.error("Error: CMS_HOST and CMS_API_KEY environment variables are required");
  process.exit(1);
}

// ============ Type Definitions ============

interface Media {
  id: number;
  url?: string | null;
}

interface CMSPrompt {
  id: number;
  title: string;
  description: string;
  content: string;
  translatedContent?: string;
  sourceMedia?: string[];
  video?: {
    url: string;
    thumbnail?: string;
  };
  media?: Media[];
  needReferenceImages?: boolean;
  imageCategories?: {
    useCases?: Array<{ id: number; title: string; slug: string }>;
  };
}

interface OutputPrompt {
  id: number;
  content: string;
  title: string;
  description: string;
  sourceMedia: string[];
  needReferenceImages: boolean;
}

interface PromptCategory {
  id: number;
  title: string;
  slug: string;
  parent?: { id: number; slug: string } | number | null;
}

interface FilterCategory {
  id: number;
  title: string;
  slug: string;
  parentId?: number | null;
  parentSlug?: string | null;
}

interface CMSResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
}

// ============ Helper Functions ============

function processPromptImages(item: CMSPrompt): string[] {
  let images: string[] = [];
  if (item.media && item.media.length > 0) {
    images = item.media.map((m) => m.url || "").filter(Boolean);
  } else {
    if (item.sourceMedia) {
      images = item.sourceMedia;
    }
    if (item.video?.thumbnail) {
      images.push(item.video.thumbnail);
    }
  }
  return images;
}

function transformToOutputPrompt(item: CMSPrompt): OutputPrompt | null {
  const sourceMedia = processPromptImages(item);
  if (sourceMedia.length === 0) {
    return null;
  }

  return {
    id: item.id,
    content: item.translatedContent || item.content,
    title: item.title,
    description: item.description,
    sourceMedia,
    needReferenceImages: item.needReferenceImages ?? false,
  };
}

function slugToFileName(slug: string): string {
  return `${slug}.json`;
}

// ============ CMS API Functions ============

async function fetchPromptCategories(): Promise<{
  allCategories: FilterCategory[];
  useCaseCategories: FilterCategory[];
}> {
  const query = {
    limit: 9999,
    sort: "sort",
    locale: "en",
    where: {
      campaign: {
        contains: "nano-banana-pro-prompts",
      },
    },
  };

  const stringifiedQuery = stringify(query, { addQueryPrefix: true });
  const url = `${CMS_HOST}/api/prompt-categories${stringifiedQuery}`;

  console.log("Fetching categories from CMS...");
  const response = await fetch(url, {
    headers: {
      Authorization: `users API-Key ${CMS_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CMS API error: ${response.statusText}`);
  }

  const data = (await response.json()) as CMSResponse<PromptCategory>;
  console.log(`Found ${data.docs.length} categories`);

  const allCategories: FilterCategory[] = data.docs.map((cat) => {
    let parentId: number | null = null;
    let parentSlug: string | null = null;

    if (cat.parent) {
      if (typeof cat.parent === "number") {
        parentId = cat.parent;
      } else if (typeof cat.parent === "object" && cat.parent !== null) {
        parentId = cat.parent.id;
        parentSlug = cat.parent.slug;
      }
    }

    return {
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      parentId,
      parentSlug,
    };
  });

  // Filter use-cases categories (children of "use-cases" parent)
  const useCaseCategories = allCategories.filter(
    (cat) => cat.parentSlug === "use-cases"
  );

  console.log(`Found ${useCaseCategories.length} use-case categories`);
  return { allCategories, useCaseCategories };
}

async function fetchAllPrompts(): Promise<CMSPrompt[]> {
  const allPrompts: CMSPrompt[] = [];
  let page = 1;
  let hasMore = true;

  const selectFields = {
    id: true,
    title: true,
    description: true,
    content: true,
    translatedContent: true,
    sourceMedia: true,
    video: true,
    media: true,
    needReferenceImages: true,
    imageCategories: true,
  };

  console.log("Fetching all prompts from CMS...");

  while (hasMore) {
    const query = {
      limit: 100,
      page,
      sort: ["sort", "-sourcePublishedAt"].join(","),
      depth: 2,
      locale: "en",
      select: selectFields,
      where: {
        model: {
          equals: "nano-banana-pro",
        },
      },
    };

    const stringifiedQuery = stringify(query, { addQueryPrefix: true });
    const url = `${CMS_HOST}/api/prompts${stringifiedQuery}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `users API-Key ${CMS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CMS API error: ${response.statusText}`);
    }

    const data = (await response.json()) as CMSResponse<CMSPrompt>;
    allPrompts.push(...data.docs);

    console.log(`Fetched page ${page}/${data.totalPages} (${allPrompts.length}/${data.totalDocs} prompts)`);

    hasMore = data.hasNextPage;
    page++;
  }

  console.log(`Total prompts fetched: ${allPrompts.length}`);
  return allPrompts;
}

// ============ Main Generation Logic ============

async function generateReferences() {
  const referencesDir = path.join(__dirname, "..", "references");

  // Ensure references directory exists
  if (!fs.existsSync(referencesDir)) {
    fs.mkdirSync(referencesDir, { recursive: true });
  }

  // Clean existing JSON files
  const existingFiles = fs.readdirSync(referencesDir).filter(f => f.endsWith(".json"));
  for (const file of existingFiles) {
    fs.unlinkSync(path.join(referencesDir, file));
  }
  console.log(`Cleaned ${existingFiles.length} existing JSON files`);

  // Fetch data from CMS
  const { useCaseCategories } = await fetchPromptCategories();
  const allPrompts = await fetchAllPrompts();

  // Organize prompts by category
  const categoryPrompts: Map<string, OutputPrompt[]> = new Map();
  const othersPrompts: OutputPrompt[] = [];

  // Initialize category maps
  for (const cat of useCaseCategories) {
    categoryPrompts.set(cat.slug, []);
  }

  // Process all prompts
  for (const prompt of allPrompts) {
    const outputPrompt = transformToOutputPrompt(prompt);
    if (!outputPrompt) continue;

    // Categorize by use cases
    const useCases = prompt.imageCategories?.useCases || [];
    if (useCases.length > 0) {
      for (const useCase of useCases) {
        const categorySlug = useCase.slug;
        if (categoryPrompts.has(categorySlug)) {
          categoryPrompts.get(categorySlug)!.push(outputPrompt);
        }
      }
    }

    // If no use cases, add to others
    if (useCases.length === 0) {
      othersPrompts.push(outputPrompt);
    }
  }

  // Write JSON files
  const writtenFiles: { name: string; count: number; slug: string }[] = [];

  // Write category files
  for (const cat of useCaseCategories) {
    const prompts = categoryPrompts.get(cat.slug) || [];
    if (prompts.length > 0) {
      const fileName = slugToFileName(cat.slug);
      fs.writeFileSync(
        path.join(referencesDir, fileName),
        JSON.stringify(prompts, null, 2)
      );
      writtenFiles.push({ name: fileName, count: prompts.length, slug: cat.slug });
      console.log(`Written ${fileName} with ${prompts.length} prompts`);
    }
  }

  // Write others.json
  fs.writeFileSync(
    path.join(referencesDir, "others.json"),
    JSON.stringify(othersPrompts, null, 2)
  );
  writtenFiles.push({ name: "others.json", count: othersPrompts.length, slug: "others" });
  console.log(`Written others.json with ${othersPrompts.length} prompts`);

  // Update SKILL.md with reference files list
  await updateSkillMd(writtenFiles, useCaseCategories);

  // Write manifest.json — single source of truth for dynamic categories
  const categoryTitleMap = new Map<string, string>();
  for (const cat of useCaseCategories) categoryTitleMap.set(cat.slug, cat.title);

  const manifest = {
    updatedAt: new Date().toISOString(),
    totalPrompts: allPrompts.length,
    categories: writtenFiles.map(f => ({
      slug: f.slug,
      title: f.slug === "others" ? "Uncategorized" : (categoryTitleMap.get(f.slug) || f.slug),
      file: f.name,
      count: f.count,
    })),
  };
  fs.writeFileSync(
    path.join(referencesDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`Written manifest.json with ${manifest.categories.length} categories`);

  console.log("\n=== Generation Complete ===");
  console.log(`Total files generated: ${writtenFiles.length}`);
  console.log(`Total prompts processed: ${allPrompts.length}`);
}

async function updateSkillMd(
  files: { name: string; count: number; slug: string }[],
  categories: FilterCategory[]
) {
  const skillMdPath = path.join(__dirname, "..", "SKILL.md");
  let content = fs.readFileSync(skillMdPath, "utf-8");

  // Build category map for titles
  const categoryTitles = new Map<string, string>();
  for (const cat of categories) {
    categoryTitles.set(cat.slug, cat.title);
  }

  // Generate references section
  const lines: string[] = [
    "<!-- REFERENCES_START -->",
    "",
    "### Use Case Category Files",
    "",
    `| File | Category | Count |`,
    `|------|----------|-------|`,
  ];

  // Add category files (including others.json)
  for (const file of files) {
    const title = file.slug === "others"
      ? "Uncategorized"
      : (categoryTitles.get(file.slug) || file.slug);
    lines.push(`| \`${file.name}\` | ${title} | ${file.count} |`);
  }

  lines.push("");
  lines.push("<!-- REFERENCES_END -->");

  // Replace the references section in SKILL.md
  const startMarker = "<!-- REFERENCES_START -->";
  const endMarker = "<!-- REFERENCES_END -->";
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker) + endMarker.length;

  if (startIndex !== -1 && endIndex !== -1) {
    content = content.slice(0, startIndex) + lines.join("\n") + content.slice(endIndex);
    fs.writeFileSync(skillMdPath, content);
    console.log("Updated SKILL.md with references list");
  } else {
    console.warn("Warning: Could not find REFERENCES markers in SKILL.md");
  }
}

// Run the script
generateReferences().catch((error) => {
  console.error("Error generating references:", error);
  process.exit(1);
});
