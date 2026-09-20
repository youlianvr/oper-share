---
name: email
description: >
  Work with Gmail — send and read emails on behalf of the user using the local
  SMTP/IMAP script. This skill is a legacy/local fallback; the canonical
  primary route for Google Workspace operations is the configured
  `google-workspace` MCP when its exact operation is verified. Can: send emails
  with attachments, read the inbox with Gmail-query search (from:, subject:,
  etc.), check mail.

  Use this skill when the user asks to:
  - Send an email / write to someone / write to email
  - Check mail / see what arrived / is there a reply
  - Write to someone on my behalf / reply to an email
  - Attach a file to an email / send with attachment
  - Get an archive password / request access via email
  - Any email-related task (send, read, check, monitor inbox)

  ⚠️ REQUIRES GMAIL_ADDRESS + GMAIL_APP_PASSWORD in .env.
     Without them, every email command will fail at auth.

  NOT for: Telegram messaging, SMS, or other non-email communication channels.
triggers:
  - 'write an email / send to email / send email / email to'
  - 'check mail / what arrived / check inbox / check email'
  - 'write to topdiag / request password / request password by email'
  - 'send file by email / send attachment'
  - 'read emails / read emails / inbox'
  - 'get archive password / password for archive'
  - 'write to them / contact by email / reply to mailbox'
---

# Email — Gmail via SMTP/IMAP (App Password; local fallback)

> Sends and reads mail for <owner>@gmail.com via Google App Password.

---

## Quick Start (From Scratch)

### 1. Set Up an App Password

If you do not have one yet — create it in 2 steps:
1. Enable [2-Step Verification](https://myaccount.google.com/security) on the account
2. Create an [App Password](https://myaccount.google.com/apppasswords) named "Buffy Email"

A 16-character password like `xxxx xxxx xxxx xxxx` will be generated.

### 2. Add to `.env` (Project Root)

File: `C:/Users/pc/.openclaw/workspace/.env`

```bash
# CWD/.env — append at the end:
GMAIL_ADDRESS=<owner>@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx    # your 16-character password
```

### 3. Done

The `_scripts/gmail.py` script now works.

---

## Commands (only after explicit user authorization for sending)

> `send` performs an external side effect. Never run it during inspection or
> automatically. Prefer verified `google-workspace` Gmail operations when
> available; use this script only as an explicitly identified local fallback.

### Sending an Email

```bash
# Simple email
python _scripts/gmail.py send \
  --to "topdiag@yandex.ru" \
  --subject "Password for VAG-COM archive" \
  --body "Hello! Please send the password for VAG-COM_Vasya_Diagnost_1.1_VCDS.zip."

# With an attachment
python _scripts/gmail.py send \
  --to "someone@example.com" \
  --subject "Report" \
  --body "File attached." \
  --attach "C:/path/to/file.pdf"

# With a copy and reply-to
python _scripts/gmail.py send \
  --to "target@example.com" \
  --cc "cc@example.com" \
  --subject "Topic" \
  --body "Text" \
  --reply-to "<owner>@gmail.com"
```

### Reading Mail

```bash
# Last 10 emails
python _scripts/gmail.py inbox

# Search by sender (Gmail syntax)
python _scripts/gmail.py inbox --search "from:topdiag@yandex.ru"

# Search by subject
python _scripts/gmail.py inbox --search "subject:password"

# More emails + full text
python _scripts/gmail.py inbox --limit 20 --search "from:yandex.ru" --raw

# Read unread
python _scripts/gmail.py inbox --search "is:unread"
```

---

## Usage Scenarios (When to Apply)

### 📬 Requesting an Archive Password

This is the most common use case. Order of actions:

1. **Send an email** to TOPDIAG@yandex.ru:
   ```
   To: TOPDIAG@yandex.ru
   Subject: Password for VAG-COM_Vasya_Diagnost_1.1_VCDS.zip
   Body: Hello! Please send the password for VAG-COM_Vasya_Diagnost_1.1_VCDS.zip. Thank you!
   ```

2. **Check the reply** after some time (5-10 minutes later):
   ```bash
   python _scripts/gmail.py inbox --search "from:topdiag@yandex.ru"
   ```

3. If there is no reply — **check spam**:
   ```bash
   python _scripts/gmail.py inbox --folder "[Gmail]/Spam" --search "from:topdiag@yandex.ru"
   ```

### 📧 Sending a File by Email

1. Check that the file exists
2. Send with `--attach "C:/path/to/file"`

### 📨 Checking Mail on User Request

Ask the user WHAT to look for (from whom, by what subject) if they did not
specify. Default — the last 5 emails.

---

## How to Reply to Emails

A reply is a normal send with `Re:` in the subject. The previous email is not
quoted automatically (MIME threading is not implemented).

```bash
python _scripts/gmail.py send \
  --to "original-sender@example.com" \
  --subject "Re: original subject" \
  --body "<reply text>"
```

---

## Env Variables

| Variable | Required | Where |
|---|---|---|
| `GMAIL_ADDRESS` | ✅ yes | `.env` in the project root (`CWD/.env`) |
| `GMAIL_APP_PASSWORD` | ✅ yes | `.env` in the project root |

The App Password is **not** the same as the regular Google password!
It is a separate 16-character key generated in the account settings.

---

## Important

- **Does not work without an App Password.** The script will fail with an
  authentication error.
- **Never print the password into logs** — env variable, not hardcode.
- **IMAP reads but does not mark as read** (BODY.PEEK[]), unless `--mark-seen`
  is given.
- **Gmail search syntax** works via `X-GM-RAW` — you can write `from:...`,
  `subject:...`, `is:unread`.
- This script is hard-coded to the account loaded from `GMAIL_ADDRESS`; do not
  assume it is the user's current account without checking the environment.
- Sending remains an external side effect and requires explicit authorization.

---

## Where the Code Lives

| File | Purpose |
|---|---|
| `_scripts/gmail.py` | Main script (send + inbox) |
| `_agent/env.md` | Env variable documentation |
| `.env` (project root) | File with GMAIL_ADDRESS and GMAIL_APP_PASSWORD |

---

## Troubleshooting

**Error:** `SMTP Authentication failed`
→ Cause: App Password wrong, expired, or 2FA not enabled.
→ Fix: recreate the App Password at https://myaccount.google.com/apppasswords

**Error:** `IMAP login failed`
→ Same cause. Check the App Password.

**Error:** `No emails found`
→ May be an empty search. Try without `--search`.
