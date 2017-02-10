const iframeStyles = require('raw-loader!./devdocs_styles')

module.exports = (content) => (
  `<html>
    <head>
      <style>${iframeStyles}</style>
    </head>
    <body>
    <main class="_content" role="main" tabindex="1">
      ${content}
    </main>
    </body>
  </html>`
)
