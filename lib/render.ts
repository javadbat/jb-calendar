export function renderHTML(): string {
  return /* html */ `
  <div class="jb-calendar-web-component">
    <section class="navigator-section">
        <div class="prev-btn arrow-btn" title="قبل">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fit=""
                preserveAspectRatio="xMidYMid meet">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
        </div>
        <div class="navigator-title">
            <span class="month"></span>
            <span class="year"></span>
            <span class="year-range"></span>
        </div>
        <div class="next-btn arrow-btn" title="بعد">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fit=""
                preserveAspectRatio="xMidYMid meet">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
        </div>

    </section>
    <section class="calendar-section">
        <div class="day-selection-section">
            <div class="week-day-wrapper">
            </div>
            <div class="month-day-container">
                <div class="prev-month-day-wrapper month-day-wrapper"></div>
                <div class="current-month-day-wrapper month-day-wrapper"></div>
                <div class="next-month-day-wrapper month-day-wrapper"></div>
            </div>
        </div>
        <div class="month-selection-section">

        </div>
        <div class="year-selection-section">
            <div class="prev-years-wrapper years-wrapper"></div>
            <div class="current-years-wrapper years-wrapper"></div>
            <div class="next-years-wrapper years-wrapper"></div>
        </div>
        <div class="swipe-up-symbol">
            <svg class="swipe-up-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_403_3281)">
                    <path
                        d="M23.7101 16.2899L15.5401 8.11994C15.0756 7.65431 14.5239 7.28488 13.9164 7.03281C13.309 6.78075 12.6578 6.651 12.0001 6.651C11.3424 6.651 10.6912 6.78075 10.0838 7.03281C9.47631 7.28488 8.92455 7.65431 8.46009 8.11994L0.290094 16.2899C0.10179 16.4782 -0.0039978 16.7336 -0.0039978 16.9999C-0.0039978 17.2662 0.10179 17.5216 0.290094 17.7099C0.478398 17.8982 0.733792 18.004 1.00009 18.004C1.2664 18.004 1.52179 17.8982 1.71009 17.7099L9.88009 9.53994C10.4426 8.97814 11.2051 8.66258 12.0001 8.66258C12.7951 8.66258 13.5576 8.97814 14.1201 9.53994L22.2901 17.7099C22.3831 17.8037 22.4937 17.8781 22.6155 17.9288C22.7374 17.9796 22.8681 18.0057 23.0001 18.0057C23.1321 18.0057 23.2628 17.9796 23.3847 17.9288C23.5065 17.8781 23.6171 17.8037 23.7101 17.7099C23.8038 17.617 23.8782 17.5064 23.929 17.3845C23.9798 17.2627 24.0059 17.132 24.0059 16.9999C24.0059 16.8679 23.9798 16.7372 23.929 16.6154C23.8782 16.4935 23.8038 16.3829 23.7101 16.2899Z"
                        />
                </g>
                <defs>
                    <clipPath id="clip0_403_3281">
                        <rect width="24" height="24" fill="white" />
                    </clipPath>
                </defs>
            </svg>
            <div class="swipe-up-text">
                نمایش سال‌ها
            </div>
        </div>
    </section>
  </div>
  `;
}