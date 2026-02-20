import { createContext, useContext, useEffect, useState } from "react"
import { sanityClient } from "../lib/sanityClient"

const SiteContext = createContext(null)

export const SiteProvider = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await sanityClient.fetch(
          `*[_id == "siteSettings"][0]{
            brandName,
            tagline,
            logo{asset->{url}},
            favicon{asset->{url}},
            defaultOgImage{asset->{url}},
            defaultTitle,
            titleTemplate,
            defaultDescription,
            defaultKeywords,
            baseUrl,
            enableIndexing,
            socialLinks,
            contactEmail,
            contactPhone,
            googleAnalyticsId,
            metaPixelId
          }`
        )

        setSiteSettings(data)
      } catch (err) {
        console.error("SiteSettings fetch failed:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return (
    <SiteContext.Provider value={{ siteSettings, loading }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)