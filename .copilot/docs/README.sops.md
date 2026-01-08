# Copilot SOPs Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, manage, and understand the SOPs (Standard Operating Procedures) database in the Digital Herencia Notion workspace.

---

## Quick Reference

| Property | Type  | Description        |
| -------- | ----- | ------------------ |
| Name     | title | SOP name and title |

---

## SOPs Database Schema

**Database ID**: `2d8a4e63-bf23-80d1-8167-000bb402c275`

### Purpose

The SOPs database stores standard operating procedures and documentation for team workflows, processes, and operational guidelines.

### Properties

| Property | Type  | Required | Description           |
| -------- | ----- | -------- | --------------------- |
| **Name** | title | ✅       | SOP name (page title) |

### Property IDs (for MCP Operations)

```json
{
  "Name": "title"
}
```

---

## Workflow Integration

### Linking SOPs to Teams

SOPs can be referenced or linked to specific teams or processes. When creating processes in other databases:

- Link to relevant SOPs for procedural context
- Add SOP links in meeting notes or project documentation
- Use comments to reference specific SOP sections

### SOP Management

**Query all SOPs**:

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2d8a4e63-bf23-80d1-8167-000bb402c275',
    page_size: 50,
  });
```

**Create new SOP**:

```typescript
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '2d8a4e63-bf23-801e-b6ac-e52358ee91dc', // Parent database ID
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'SOP: Incident Response Procedure',
            },
          },
        ],
      },
    },
  });
```

**Append SOP content**:

```typescript
mcp_notionapi_API -
  patch -
  block -
  children({
    block_id: 'sop-page-id',
    children: [
      {
        type: 'heading_1',
        heading_1: {
          rich_text: [
            {
              text: {
                content: 'Incident Response Procedure',
              },
            },
          ],
        },
      },
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: 'Follow these steps when responding to system incidents...',
              },
            },
          ],
        },
      },
    ],
  });
```

---

## Best Practices

- **Clear naming**: Use descriptive titles that identify the process
- **Comprehensive documentation**: Include step-by-step instructions
- **Regular updates**: Review and update SOPs when processes change
- **Cross-linking**: Reference related SOPs within documentation
- **Team assignments**: Link SOPs to responsible teams in page content

---

## Example SOPs

Common SOPs include:

- Incident response procedures
- Change management process
- Onboarding workflows
- Code review standards
- Deployment procedures
- Security protocols
- Communication guidelines
- Escalation procedures

---

**End of SOPs Reference**
