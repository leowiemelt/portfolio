console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );

// currentLink?.classList.add("current");

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  // next step: create link and add it to nav
   let a = document.createElement('a');
   a.href = url;
   a.textContent = title;
   nav.append(a);
}

if (a.host === location.host && a.pathname === location.pathname) {
  a.classList.add('current');
}

a.classList.toggle(
  'current',
  a.host === location.host && a.pathname === location.pathname,
);