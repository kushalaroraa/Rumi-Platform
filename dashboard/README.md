
  # Single Page UI Design

  This is a code bundle for Single Page UI Design. The original project is available at https://www.figma.com/design/JTIq1Ab5ZY7wl1hppg1eOj/Single-Page-UI-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Beginner-Friendly Notes

  - `src/main.tsx` is the app entrypoint; it renders `App` into the DOM.
  - `src/app/App.tsx` sets up React Router and entry wrappings.
  - `src/app/MainApp.tsx` includes navigation and page rendering logic with clear, typed `PageKey` and `navItems`.
  - Pages are in `src/app/components`: `Dashboard`, `Messages`, `Preferences`, `Profile`, `Settings`, `DiscoverMatches`, `MyMatches`, `ActivityStats`.

  This structure keeps UI unchanged while making code easier to present and extend.
  