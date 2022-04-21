/**
 * Retorna dados da aba atual
 * @returns {Tab}
 */
 export async function getCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        return tab
    } catch (e) {
        return null
    }
}