import azelaicAcid from '@/assets/ingredients/ingredient-azelaic-acid.png';
import biotin from '@/assets/ingredients/ingredient-biotin.png';
import caffeine from '@/assets/ingredients/ingredient-caffeine.png';
import capixyl from '@/assets/ingredients/ingredient-capixyl.png';
import catalase from '@/assets/ingredients/ingredient-catalase.png';
import darkenyl from '@/assets/ingredients/ingredient-darkenyl.png';
import finasteride from '@/assets/ingredients/ingredient-finasteride.png';
import foTi from '@/assets/ingredients/ingredient-fo-ti.png';
import ginseng from '@/assets/ingredients/ingredient-ginseng.png';
import greenTea from '@/assets/ingredients/ingredient-green-tea.png';
import greyverse from '@/assets/ingredients/ingredient-greyverse.png';
import horsetail from '@/assets/ingredients/ingredient-horsetail.png';
import jojoba from '@/assets/ingredients/ingredient-jojoba.png';
import lTyrosine from '@/assets/ingredients/ingredient-l-tyrosine.png';
import minoxidil from '@/assets/ingredients/ingredient-minoxidil.png';
import nettle from '@/assets/ingredients/ingredient-nettle.png';
import nettleRoot from '@/assets/ingredients/ingredient-nettle-root.png';
import paba from '@/assets/ingredients/ingredient-paba.png';
import panthenol from '@/assets/ingredients/ingredient-panthenol.png';
import procapil from '@/assets/ingredients/ingredient-procapil.png';
import rosemary from '@/assets/ingredients/ingredient-rosemary.png';
import sage from '@/assets/ingredients/ingredient-sage.png';
import sawPalmetto from '@/assets/ingredients/ingredient-saw-palmetto.png';
import zinc from '@/assets/ingredients/ingredient-zinc.png';

/** Real macro still-life photography for each of the 24 real ingredients
 *  (see docs/image-generation-prompts.txt §0b) — keyed by the exact
 *  `Ingredient.name` string from `content/products.ts`, the single source
 *  of truth for ingredient names. Shared by every surface that renders an
 *  `IngredientCard` (currently `/magazine`) so they stay in sync. */
export const INGREDIENT_PHOTOS: Record<string, string> = {
  Minoxidil: minoxidil,
  Finasteride: finasteride,
  'Azelaic Acid': azelaicAcid,
  'Saw Palmetto': sawPalmetto,
  'Nettle Root': nettleRoot,
  'Procapil®': procapil,
  'Capixyl™': capixyl,
  Caffeine: caffeine,
  Ginseng: ginseng,
  Rosemary: rosemary,
  'Greyverse™': greyverse,
  'Darkenyl™': darkenyl,
  'Fo-Ti': foTi,
  Biotin: biotin,
  Catalase: catalase,
  'L-Tyrosine': lTyrosine,
  PABA: paba,
  Zinc: zinc,
  'Green Tea': greenTea,
  Panthenol: panthenol,
  Nettle: nettle,
  Horsetail: horsetail,
  Sage: sage,
  Jojoba: jojoba,
};
