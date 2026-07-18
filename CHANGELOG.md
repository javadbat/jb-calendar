# Changelog

## [5.2.0] 2.26-07-18

### Changed

- Calendar navigation, day, month, and year controls now use native buttons with visible keyboard focus and native disabled semantics.
- Standardized theme recipes on `jb-calendar.<theme>-style` and composed `jb-date-input.<theme>-style::part(calendar)` selectors.

## 5.1.0

### Added

- Added CSS parts for calendar customization: `root`, `navigator`, `arrow-button`, `prev-button`, `next-button`, `navigator-title`, `navigator-month`, `navigator-year`, `navigator-year-range`, `calendar`, `day-section`, `week-day-wrapper`, `week-day`, `month-day-container`, `month-day-wrapper`, `prev-month-day-wrapper`, `current-month-day-wrapper`, `next-month-day-wrapper`, `empty-day`, `day`, `today-day`, `selected-day`, `disabled-day`, `day-button`, `day-number`, `status-point`, `month-section`, `month`, `month-name`, `year-section`, `years-wrapper`, `prev-years-wrapper`, `current-years-wrapper`, `next-years-wrapper`, `year`, `year-number`, `swipe-up`, `swipe-up-icon`, and `swipe-up-text`.

### Changed

- Breaking: renamed public CSS variables from `--jb-calendar-*-bgcolor*` to `--jb-calendar-*-bg-color*`.
