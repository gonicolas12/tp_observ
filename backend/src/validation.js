// Petites fonctions pures de validation, isolées ici pour être testables
// sans base de données ni serveur HTTP (utilisées par l'étape "test" du CI).

/**
 * Valide et normalise un titre de tâche.
 * @param {*} title - valeur reçue dans la requête
 * @returns {{ ok: boolean, value?: string, error?: string }}
 */
function validateTitle(title) {
  if (typeof title !== "string" || title.trim().length === 0) {
    return { ok: false, error: "Title is required" };
  }
  if (title.trim().length > 120) {
    return { ok: false, error: "Title too long (max 120)" };
  }
  return { ok: true, value: title.trim() };
}

module.exports = { validateTitle };
