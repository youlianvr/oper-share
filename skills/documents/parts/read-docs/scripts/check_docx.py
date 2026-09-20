#!/usr/bin/env python3
"""check_docx.py - analyze .docx structure: paragraphs, styles, headings, fonts, page breaks."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from docx import Document
def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "file.docx"
    doc = Document(path)
    styles = {}
    headings = []
    for p in doc.paragraphs:
        s = p.style.name
        styles[s] = styles.get(s, 0) + 1
        if s.startswith("Heading"):
            headings.append(f"[{s}] {p.text}")
    fonts = set()
    for p in doc.paragraphs[:10]:
        for run in p.runs:
            if run.font.name: fonts.add(run.font.name)
    print(f"file: {path}")
    print(f"paragraphs: {len(doc.paragraphs)}  tables: {len(doc.tables)}")
    print("styles:", styles)
    print("fonts (first 10 paras):", sorted(fonts))
    if headings:
        print("headings:")
        for h in headings[:20]: print("  " + h)
if __name__ == "__main__":
    main()
