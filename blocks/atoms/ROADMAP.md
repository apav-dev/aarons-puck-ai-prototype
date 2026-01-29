# Atomic Components Roadmap

This document outlines future atomic components to be added to the component library.

## Phase 2: Enhanced Components

### Typography Components

#### RichText
WYSIWYG editor component for complex formatted text with inline formatting, links, and lists.
- **Props**: content (rich text), fontSize, fontFamily, color, textAlign, maxWidth
- **Use Cases**: Long-form content, blog posts, detailed descriptions

#### List
Ordered and unordered lists with custom styling.
- **Props**: items (array), type (ordered/unordered), bulletStyle, spacing, fontSize, color
- **Use Cases**: Feature lists, service lists, navigation menus

#### Blockquote
Styled quote component for testimonials and quotes.
- **Props**: quote (text), author (optional), citation (optional), style (minimal/modern/classic), fontSize, color, borderColor
- **Use Cases**: Customer testimonials, featured quotes, callouts

### Media Components

#### Video
Embedded video component with poster images and controls.
- **Props**: src (video URL), poster (image URL), autoplay, loop, muted, controls, aspectRatio, borderRadius
- **Use Cases**: Product demos, promotional videos, background videos

#### IconText
Icon + text combination component (common pattern).
- **Props**: icon (emoji/text/URL), text, iconPosition (left/right/top), iconSize, spacing, fontSize, color, alignment
- **Use Cases**: Service items, feature lists, navigation items

#### Avatar
Circular profile image component.
- **Props**: src (image URL), alt, size (small/medium/large), borderWidth, borderColor, fallback (text/emoji)
- **Use Cases**: Team members, user profiles, testimonials

### Interactive Components

#### Link
Styled text link component (distinct from Button).
- **Props**: href, text, color, underline (always/hover/none), fontSize, fontWeight, icon (optional)
- **Use Cases**: Inline links, navigation links, footer links

#### Badge
Small label/tag component for status, categories, or labels.
- **Props**: text, variant (primary/secondary/success/warning/error), size (small/medium), borderRadius, color, backgroundColor
- **Use Cases**: Status indicators, category tags, featured labels

#### Toggle
Accordion-style collapsible content component.
- **Props**: title, content (Slot), defaultOpen, iconPosition, titleStyle, contentStyle
- **Use Cases**: FAQs, expandable sections, collapsible content

### Layout Utilities

#### Divider
Horizontal or vertical separator line component.
- **Props**: orientation (horizontal/vertical), thickness, color, spacing (margin), style (solid/dashed/dotted)
- **Use Cases**: Section separators, content dividers, visual breaks

#### Columns
Two-column text layout component.
- **Props**: leftContent (Slot), rightContent (Slot), columnGap, equalWidth, responsive (stack on mobile)
- **Use Cases**: Two-column text layouts, side-by-side content

## Phase 3: Form Elements

### Input
Text input field component.
- **Props**: label, placeholder, type (text/email/password/tel/url), required, error, helperText, width, size (small/medium/large)

### Textarea
Multi-line text input component.
- **Props**: label, placeholder, rows, required, error, helperText, width, resize (none/both/vertical/horizontal)

### Select
Dropdown selection component.
- **Props**: label, options (array), placeholder, required, error, helperText, width, size (small/medium/large)

### Checkbox
Checkbox input component.
- **Props**: label, checked, required, error, helperText, size (small/medium/large)

### Radio
Radio button input component.
- **Props**: name, options (array), selected, required, error, helperText, orientation (horizontal/vertical)

## Implementation Notes

- All components should follow the same structure as Phase 1 components
- Include comprehensive props with AI instructions
- Support Google Fonts integration where applicable
- Use CSS modules for styling
- Include default props
- Consider accessibility (ARIA labels, keyboard navigation, screen readers)
- Ensure responsive behavior where applicable
- Support brand color integration via getBrandColors tool
- Support image integration via getImage tool
- Support font integration via getFontFamily tool

## Priority Order

1. **High Priority** (Common patterns):
   - List
   - IconText
   - Link
   - Divider

2. **Medium Priority** (Useful enhancements):
   - RichText
   - Blockquote
   - Badge
   - Avatar

3. **Lower Priority** (Specialized use cases):
   - Video
   - Toggle
   - Columns

4. **Phase 3** (Form elements - requires form handling infrastructure):
   - All form components








