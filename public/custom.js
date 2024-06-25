document.addEventListener('DOMContentLoaded', function () {
  const logoText = document.querySelector('.adminjs_Logo h1')
  if (logoText) {
    logoText.innerText += `\n(${
      Intl.DateTimeFormat().resolvedOptions().timeZone
    })`
  }
})
