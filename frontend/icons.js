// IconManager: allows injecting custom icons via window.AppConfig.ICONS
// Usage:
// window.AppConfig = window.AppConfig || {};
// window.AppConfig.ICONS = {
//   map: 'data:image/svg+xml;utf8,<svg ...></svg>',
//   tree: '/assets/icons/tree.svg',
//   profile: 'data:image/svg+xml;utf8,<svg ...></svg>'
// };

(function(global){
  const defaultIcons = {
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21l-4.35-4.35" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="11" cy="11" r="6" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    filter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16M6 12h12M10 18h4" stroke="#222" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    map: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m15 21l-6-2.1l-4.65 1.8q-.5.2-.925-.112T3 19.75v-14q0-.325.188-.575T3.7 4.8L9 3l6 2.1l4.65-1.8q.5-.2.925.113T21 4.25v14q0 .325-.187.575t-.513.375zm-1-2.45V6.85l-4-1.4v11.7zm2 0l3-1V5.7l-3 1.15zM5 18.3l3-1.15V5.45l-3 1zM16 6.85v11.7zm-8-1.4v11.7z"/></svg>`,
    tree: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11.964 6.97s-3.075.306-4.685-1.035C5.669 4.593 6.036 2.03 6.036 2.03s3.075-.306 4.686 1.035c1.61 1.342 1.242 3.905 1.242 3.905"/><path d="M12.036 6.97s3.075.306 4.685-1.035c1.61-1.342 1.243-3.905 1.243-3.905s-3.075-.306-4.685 1.035c-1.61 1.342-1.243 3.905-1.243 3.905M4 11a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm1 3h14l-2 8H7z"/></g></svg>`,
    rating: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 21H9v-8.4a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6zm5.4 0H15v-2.9a.6.6 0 0 1 .6-.6h4.8a.6.6 0 0 1 .6.6v2.3a.6.6 0 0 1-.6.6M9 21v-4.9a.6.6 0 0 0-.6-.6H3.6a.6.6 0 0 0-.6.6v4.3a.6.6 0 0 0 .6.6zm1.806-15.887l.909-1.927a.312.312 0 0 1 .57 0l.91 1.927l2.032.311c.261.04.365.376.176.568l-1.47 1.5l.347 2.118c.044.272-.228.48-.462.351l-1.818-1l-1.818 1c-.233.128-.506-.079-.462-.351l.347-2.118l-1.47-1.5c-.19-.192-.085-.528.175-.568z"/></svg>`,
    profile: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="m252.522 469.306l3.478.028a218 218 0 0 1-14.118-.46a215 215 0 0 1-17.38-1.85a213 213 0 0 1-19.919-3.928a212 212 0 0 1-19.18-5.72l-.035-.013a212 212 0 0 1-30.135-13.28a213 213 0 0 1-19.968-12.178a214 214 0 0 1-20.709-16.2a215 215 0 0 1-6.748-6.243C67.643 370.666 42.667 316.25 42.667 256C42.667 138.18 138.18 42.667 256 42.667A213.333 213.333 0 0 1 469.334 256c0 60.252-24.978 114.67-65.144 153.464q-.002.004 0 .012a214.6 214.6 0 0 1-32.954 26.088l-.165.105a209 209 0 0 1-8.15 4.977l-.291.17a214 214 0 0 1-14.764 7.78a227 227 0 0 1-5.935 2.724a225 225 0 0 1-6.272 2.645a225 225 0 0 1-6.155 2.368a224 224 0 0 1-6.29 2.197a222 222 0 0 1-6.245 1.964a219 219 0 0 1-6.677 1.87a218 218 0 0 1-6.552 1.608a217 217 0 0 1-6.584 1.395a213 213 0 0 1-27.179 3.516a216 216 0 0 1-6.81.333l-.044.001a217 217 0 0 1-10.601.089m24.812-127.972h-42.667c-33.983 0-63.704 19.997-77.367 49.236l-1.545 3.542l1.337.989c24.316 17.32 53.367 28.425 84.834 30.994l.13.01l-.13-.01q1.409.115 2.824.207l-2.694-.197q1.375.112 2.756.201l-.062-.004q1.368.09 2.74.157l-2.678-.153q1.425.093 2.858.161l-.18-.008q1.029.05 2.058.088l6.452.12l2.675-.02a173 173 0 0 0 2.95-.07l-2.7.065q1.365-.022 2.725-.067l-.025.001q1.371-.044 2.738-.11l-2.713.11q1.41-.047 2.819-.116l-.106.006q1.424-.07 2.84-.16l-2.734.154q1.387-.067 2.77-.157l-.035.002q1.386-.09 2.766-.201l-2.732.199q1.41-.092 2.817-.206l-.085.007q1.34-.11 2.674-.238l-2.589.23q1.4-.114 2.794-.25l-.205.02c30.416-2.944 58.496-13.872 82.119-30.662l1.461-1.092l-1.522-3.538c-13.065-27.968-40.827-47.484-72.96-49.128zM256 85.334c-94.256 0-170.666 76.41-170.666 170.666c0 40.704 14.249 78.08 38.031 107.41c22.028-38.672 63.62-64.743 111.302-64.743h42.667c47.683 0 89.276 26.073 111.3 64.74c23.783-29.327 38.033-66.703 38.033-107.407c0-94.256-76.41-170.666-170.667-170.666m0 21.333c47.129 0 85.334 38.205 85.334 85.333c0 45.7-35.925 83.01-81.075 85.23l-4.259.104c-47.128 0-85.333-38.205-85.333-85.334c0-45.7 35.925-83.01 81.074-85.229zm0 42.667c-23.564 0-42.666 19.102-42.666 42.666s19.102 42.667 42.666 42.667s42.667-19.103 42.667-42.667s-19.103-42.666-42.667-42.666"/></svg>`,
    chevron: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#9aa0a6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    chevronDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#9aa0a6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    water: `<svg width="43" height="54" viewBox="0 0 43 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M43 37C43 47.7696 28.9575 54 21.6504 54C14.3432 54 1.74139e-06 47.7696 1.74139e-06 37C1.74139e-06 26.2304 14.3432 0 21.6504 0C30.3706 0 43 26.2304 43 37Z" fill="#71A6D8"/>
<ellipse cx="11.5793" cy="33.2859" rx="2.77725" ry="5.95739" transform="rotate(8 11.5793 33.2859)" fill="#FAFAFA"/>
</svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#2ecc71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  function getIconHtml(name){
    const cfg = (global.AppConfig && global.AppConfig.ICONS) || {};
    if (cfg[name]) {
      if (cfg[name].trim().startsWith('<svg')) return cfg[name];
      return `<img src="${cfg[name]}" alt="${name}" style="width:1.6rem;height:1.6rem;display:inline-block" />`;
    }
    return defaultIcons[name] || '';
  }

  function replaceIcons(root = document){
    root.querySelectorAll('[data-icon]').forEach(el => {
      const name = el.getAttribute('data-icon');
      if (!name) return;
      el.innerHTML = getIconHtml(name);
    });
  }
  global.IconManager = {
    getIconHtml,
    replaceIcons
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => IconManager.replaceIcons());
  } else {
    IconManager.replaceIcons();
  }

})(window);