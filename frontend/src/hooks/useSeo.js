import { useEffect } from 'react'

const SITE_NAME = 'Loris Lorenzini'
const BASE_URL = 'https://lorislorenzini.fr'

const setMeta = (selector, attr, name, content) => {
  if (!content) return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Met à jour le titre, la description et l'URL canonique de la page.
 * Google exécute le JavaScript et prend donc ces valeurs en compte.
 * Les réseaux sociaux, eux, ne l'exécutent pas : leurs aperçus
 * proviennent des balises statiques de index.html.
 */
const useSeo = ({ title, description, path }) => {
  useEffect(() => {
    if (title) {
      document.title = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    }

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)

    if (path) {
      let link = document.head.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', `${BASE_URL}${path}`)
      setMeta('meta[property="og:url"]', 'property', 'og:url', `${BASE_URL}${path}`)
    }
  }, [title, description, path])
}

export default useSeo
