# Copilot Blog Reference Guide

> **Purpose**: This document is the authoritative reference for Copilot to query, manage, and understand the "Regrets, Cigarettes, & Neural Nets" blog database in the Digital Herencia Notion workspace. Use this guide when managing blog content, curating resources, and organizing personal knowledge.

---

## Quick Reference

| Property  | Type         | Description                                                         |
| --------- | ------------ | ------------------------------------------------------------------- |
| Name      | title        | Article/resource name                                               |
| Type      | multi_select | Content type (Book, Youtube, Article, Podcast, Document, Blog Post) |
| Tags      | multi_select | Topic tags (Mindfulness, Development, Psychology, etc.)             |
| Published | date         | Publication or discovery date                                       |
| Status    | select       | Active or Inactive (Archive)                                        |

---

## Blog Database Schema

**Database ID**: `2cda4e63-bf23-81b2-90ed-000b622c6dfc`

**Title**: "Regrets, Cigarettes, & Neural Nets"

**Description**: Personal blog with curated articles, books, videos, and resources on mindfulness, development, psychology, and lifestyle

### Purpose

The blog database serves as:

- Personal knowledge management system
- Curated collection of articles, books, and videos
- Topic-organized resource library
- Reflection and learning tracker
- Reference for professional and personal development

### Properties

| Property      | Type         | ID                                     | Description                        |
| ------------- | ------------ | -------------------------------------- | ---------------------------------- |
| **Name**      | title        | `title`                                | Article/resource name (page title) |
| **Type**      | multi_select | `2dabec48-03d9-4f40-8746-750320c47a4e` | Content type(s)                    |
| **Tags**      | multi_select | `T%5Cnr`                               | Topic/subject tags                 |
| **Published** | date         | `wOPZ`                                 | Publication or discovery date      |
| **Status**    | select       | `a8acba64-da24-43fa-818a-81cb58fc6744` | Active or archived status          |

---

## Type Options

Specify the content type(s). Can select multiple:

- **Book**: Books and reading materials
- **Youtube**: Video content from YouTube
- **Article**: Articles and written content
- **Podcast**: Podcast episodes
- **Document**: Documents, papers, PDFs
- **Blog Post**: Blog post content

---

## Tag Options

Organize by topic using tags. Select as many as apply:

**Personal Development**:

- Mindfulness - Meditation, awareness, presence
- Development - Professional growth, learning
- Psychology - Understanding behavior and mind
- Mental Health - Well-being, stress, resilience
- Learning - Education, skill building

**Lifestyle**:

- Lifestyle - Living habits, routines, balance
- Hobbies - Personal interests and activities
- Humor - Funny, entertaining content

**Technical**:

- Tech - Technology, programming, software
- Development (also under personal)

---

## Status Options

Track content status:

- **Active**: Currently relevant and accessible
- **Inactive [ Archive ]**: Archived or no longer actively referenced

---

## MCP Operations

### Query All Blog Entries

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    page_size: 50,
  });
```

### Query by Type

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Type',
      multi_select: {
        contains: 'Article',
      },
    },
  });
```

### Query by Tag

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Tags',
      multi_select: {
        contains: 'Mindfulness',
      },
    },
  });
```

### Query Active Entries Only

```typescript
mcp_notionapi_API -
  query -
  data -
  source({
    data_source_id: '2cda4e63-bf23-81b2-90ed-000b622c6dfc',
    filter: {
      property: 'Status',
      select: {
        equals: 'Active',
      },
    },
  });
```

### Create New Blog Entry

```typescript
mcp_notionapi_API -
  post -
  page({
    parent: {
      database_id: '2cda4e63-bf23-806f-8d9f-c46e6e0cf7bd', // Parent database ID
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'The Art of Attention',
            },
          },
        ],
      },
      Type: {
        multi_select: [{ name: 'Book' }, { name: 'Article' }],
      },
      Tags: {
        multi_select: [{ name: 'Mindfulness' }, { name: 'Psychology' }, { name: 'Learning' }],
      },
      Published: {
        date: {
          start: '2025-12-15',
        },
      },
      Status: {
        select: {
          name: 'Active',
        },
      },
    },
  });
```

### Update Entry Status to Archive

```typescript
mcp_notionapi_API -
  patch -
  page({
    page_id: 'blog-entry-id',
    properties: {
      Status: {
        select: {
          name: 'Inactive [ Archive ]',
        },
      },
    },
  });
```

---

## Entry Organization Patterns

### By Content Type

Organize and find content by how you consume it:

- **Books**: Long-form learning and deep dives
- **YouTube**: Visual and audio learning
- **Articles**: Quick reads and specific topics
- **Podcasts**: Audio content for commutes/multitasking
- **Documents**: Academic or technical papers
- **Blog Posts**: Personal reflections and insights

### By Topic Tag

Cross-cut organization by subject matter:

- **Mindfulness**: Meditation, awareness, presence
- **Development**: Skill building, professional growth
- **Psychology**: Understanding behavior, cognition
- **Mental Health**: Well-being, resilience, therapy
- **Learning**: Education methods, knowledge
- **Tech**: Programming, software, technology
- **Lifestyle**: Habits, routines, living
- **Hobbies**: Personal interests, recreation

### By Publication Date

Track when you discovered or read content:

- Recent additions to your reading list
- Content organized by year or season
- Trends in what you're consuming

---

## Best Practices

1. **Meaningful names**: Use clear titles that reflect content
2. **Multiple types**: Don't hesitate to tag as multiple types
3. **Consistent tagging**: Use existing tags for consistency
4. **Regular archiving**: Move outdated content to inactive
5. **Add summaries**: Include content summaries in the page
6. **Track sources**: Include original links/sources
7. **Personal notes**: Add reflections and key takeaways
8. **Date discovery**: Track when you found resources

---

## Example Blog Entry Structure

When creating a new entry, consider including:

```markdown
# Article Name

## Source

- URL: [Link to original]
- Type: [Content type]
- Author: [Creator name]
- Published: [Date]

## Summary

Brief overview of what the content is about.

## Key Takeaways

- Takeaway 1
- Takeaway 2
- Takeaway 3

## Personal Notes

Your reflections and how it relates to your work/life.

## Related Reading

- Link to related blog entry
- Link to related resource
```

---

## Content Discovery Workflow

1. **Find** content through reading, browsing, or recommendations
2. **Save** to blog database with metadata
3. **Tag** consistently for future discovery
4. **Read/Consume** and take notes
5. **Reflect** by adding personal insights
6. **Reference** when relevant to work or discussions
7. **Archive** when no longer active reference

---

## Knowledge Management Strategy

The blog serves as your personal knowledge repository:

- **Capture**: Save interesting resources immediately
- **Organize**: Tag and categorize for later retrieval
- **Review**: Periodically review entries by topic
- **Apply**: Reference and use in your work
- **Reflect**: Add notes and personal insights
- **Share**: Reference in team discussions and decisions

---

**End of Blog Reference**
