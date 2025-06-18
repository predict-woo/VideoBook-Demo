# Video Book Player

[![Netlify Status](https://api.netlify.com/api/v1/badges/bd3dc4e0-f38e-4edb-9ef6-c6f4aed8a8f3/deploy-status)](https://app.netlify.com/projects/readx-video-book/deploys)

This project is a web-based video player that creates a "video book" experience using [Remotion](https://remotion.dev). It combines a primary video with synchronized, animated subtitles and illustrative overlays that appear at designated times.

## Features

- **Dynamic Video Composition**: The video is a Remotion composition, allowing for programmatic animations and overlays.
- **Scrolling Subtitles**: Subtitles are displayed in a scrolling view that automatically keeps the current line centered and highlighted.
- **Illustrative Overlays**: Illustrations (images) can be scheduled to appear over the main video, which animates to a smaller size to accommodate them.
- **Responsive Layout**: The player and UI adapt to different screen sizes.
- **Playback Controls**: The user can control the playback speed of the video.
- **Data-Driven Content**: Video, subtitles, and illustrations are loaded from external SRT and video files, defined by a Zod schema.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install the dependencies:
    ```bash
    pnpm install
    ```

### Running the Application

-   **Development Server**: To run the web application locally, use the following command. This will start a Vite development server.
    ```bash
    pnpm dev
    ```
-   **Remotion Studio**: To work on the Remotion composition (`Template.tsx`) in isolation, you can use the Remotion Studio.
    ```bash
    pnpm remotion:studio
    ```

## Key Components

### `src/VideoBook.tsx`

This is the main React component for the application. It sets up the `@remotion/player` and integrates it into the application's UI. It's responsible for:

-   Managing the layout and responsiveness.
-   Passing the necessary properties (video URL, SRT URLs) to the Remotion composition.
-   Rendering the player controls.

### `app/remotion/components/Template.tsx`

This is the core Remotion composition. It defines what is actually rendered in the video player. Its responsibilities include:

-   Fetching and parsing SRT files for subtitles and illustration timings.
-   Rendering the main video.
-   Displaying and animating the subtitles based on the current time of the video. The subtitles scroll smoothly to keep the active line in view.
-   Handling the animations for showing and hiding illustrations. When an illustration appears, the main video shrinks and moves to the corner.

## How It Works

The application uses two types of SRT files: one for the spoken subtitles and another to schedule the appearance of illustrations.

1.  **Data Fetching**: The `Template` component fetches and parses both SRT files when it first renders.
2.  **Subtitle Scrolling**:
    -   All subtitles are rendered in a long vertical container.
    -   `useLayoutEffect` is used to measure the position and size of each subtitle line and the height of the container.
    -   Based on the current video time, the `currentSrtIndex` is determined.
    -   A target `scrollY` value is calculated to center the current subtitle within the visible area.
    -   A `spring` animation from Remotion is used to smoothly animate the `transform: translateY` property of the subtitle container, creating the scrolling effect.
3.  **Illustration Animation**:
    -   The `illustrationSrtUrl` defines timecodes for illustrations.
    -   When the video playback time enters a range defined in the illustration SRT, the `currentIllustration` is set.
    -   This triggers a `spring` animation (`animVideo`) that scales down and translates the main video to a corner.
    -   The illustration image is displayed in the space created.
    -   When the timecode passes, another animation grows the video back to its original size.