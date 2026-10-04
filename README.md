# React + Vite

## Deploying to Netlify

- Set the build command to `npm run build` and the publish directory to `dist`.
- Add `VITE_API_URL` in Netlify's environment variables with the same API base URL used in your local `.env`. Use your hosted HTTPS backend URL, including any API path prefix.
- Trigger a new production build after changing the variable. Vite includes this value in the JavaScript at build time.
- For manual deployments, run `npm run build` with `VITE_API_URL` configured locally, then upload the new `dist` folder.

The `public/_redirects` file supplies the fallback for React Router pages. If login works but categories cannot load, check that the API URL was present during the build and that the backend allows requests from your Netlify domain.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
