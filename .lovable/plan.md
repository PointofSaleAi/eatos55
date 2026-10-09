# Fix header action icon hover contrast

## Confirmed issue
The recording shows the dark header’s action buttons changing to an almost-white background while their icons remain white, causing the icons to disappear on hover. The shared header action style currently combines `hover:bg-muted` with `hover:text-topbar-foreground`; in the light theme, `muted` is nearly white and `topbar-foreground` is white.

## Plan
1. Update the shared header action-button style to use a dark-header-specific hover surface with clear contrast, while keeping the icons light and preserving the current button size, spacing, and header structure.
2. Apply the same contrast-safe hover treatment to the other interactive controls in the shared header, including switch-user and account actions, without changing their normal appearance or behavior.
3. Check hover, keyboard focus, active/open states, and icon visibility in both light and dark appearance modes.
4. Verify the shared header on phone, tablet, and desktop widths so the fix is consistent wherever those actions appear, with no layout or spacing changes.

## Technical details
- Limit changes to the shared header presentation code and existing semantic top-bar tokens/classes.
- Do not alter navigation, click actions, iconography, button dimensions, or screen layouts.
- Validate the live header with browser hover checks and confirm the project remains error-free.
