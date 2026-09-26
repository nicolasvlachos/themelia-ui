import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

/* Each module stylesheet imports core.css (the tokens and the layer order) itself. */
import "themelia-ui/base/buttons.css"
import "themelia-ui/base/forms.css"
import "themelia-ui/base/structure.css"
import "themelia-ui/base/text-inputs.css"
import "themelia-ui/base/typography.css"
import "themelia-ui/base/badge.css"
import "themelia-ui/features/data-view.css"
import "themelia-ui/features/overlays.css"
import "themelia-ui/layout/page.css"

import { App } from "./app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
