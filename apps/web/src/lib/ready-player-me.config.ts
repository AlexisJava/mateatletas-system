/**
 * Configuración centralizada de Ready Player Me
 *
 * Credenciales oficiales de Mateatletas:
 * - Subdomain: mateatlatasgym
 * - App ID: 6901874930e533f99f442a89
 * - Org ID: 690163a62796d3f7d8ac2edb
 */

export const RPM_CONFIG = {
  subdomain: process.env.NEXT_PUBLIC_RPM_SUBDOMAIN || 'mateatlatasgym',
  appId: process.env.NEXT_PUBLIC_RPM_APP_ID || '6901874930e533f99f442a89',

  /**
   * Genera URL del viewer de Ready Player Me
   * @param avatarUrl - URL del avatar .glb
   * @param animation - (Opcional) URL de animación .glb
   * @returns URL completa del viewer con frameApi
   */
  getViewerUrl: (avatarUrl: string, animation?: string) => {
    const baseUrl = `https://${RPM_CONFIG.subdomain}.readyplayer.me/avatar`
    const params = new URLSearchParams({
      frameApi: 'true',
      clearCache: 'true',
      url: avatarUrl,
    })

    if (animation) {
      params.append('animationSrc', animation)
    }

    return `${baseUrl}?${params.toString()}`
  },

  /**
   * Genera URL simple para vista rápida (header, miniaturas)
   * Usa el formato antiguo con scene parameter
   * @param avatarUrl - URL del avatar .glb
   * @param scene - Tipo de escena (halfbody-portrait-v1, fullbody-portrait-v1)
   * @returns URL directa para renderizado rápido
   */
  getQuickViewUrl: (avatarUrl: string, scene: 'halfbody' | 'fullbody' = 'halfbody') => {
    const sceneParam = scene === 'halfbody' ? 'halfbody-portrait-v1' : 'fullbody-portrait-v1'
    const avatarId = avatarUrl.split('/').pop()?.replace('.glb', '')
    return `https://models.readyplayer.me/${avatarId}?scene=${sceneParam}&meshLod=1`
  },

  /**
   * Animaciones disponibles de Ready Player Me
   */
  animations: {
    idle: 'https://models.readyplayer.me/animations/idle.glb',
    idle2: 'https://models.readyplayer.me/animations/idle-2.glb',
    dancing: 'https://models.readyplayer.me/animations/dancing.glb',
    waving: 'https://models.readyplayer.me/animations/waving.glb',
    clapping: 'https://models.readyplayer.me/animations/clapping.glb',
    victory: 'https://models.readyplayer.me/animations/victory-dance.glb',
    celebration: 'https://models.readyplayer.me/animations/celebrate.glb',
  }
}
