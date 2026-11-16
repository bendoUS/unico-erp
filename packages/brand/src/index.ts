/**
 * Identité du produit, partagée par l'ERP web, la landing et l'app mobile.
 *
 * Pour renommer l'application, on modifie `packages/brand/brand.json` et lui seul.
 * Champs :
 * - name : nom court (menu, onglets, icône)
 * - fullName : nom complet (titres, stores)
 * - tagline, description : textes de présentation
 * - appId : identifiant iOS et Android. Il ne peut plus changer après la première
 *   publication sur les stores : à fixer avant.
 * - scheme : liens profonds de l'app mobile (unico://...)
 * - slug : identifiant du projet Expo
 * - primaryColor : couleur principale
 * - whatsapp : numéro commercial, format international sans « + »
 */
import brand from "../brand.json";

export const BRAND = brand;
export type Brand = typeof brand;

/** Titre de page : « Clients · Unico ». */
export function pageTitle(title?: string) {
  return title ? `${title} · ${BRAND.name}` : BRAND.fullName;
}

/** Lien WhatsApp avec un message prérempli. */
export function whatsappLink(message: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(message)}`;
}
