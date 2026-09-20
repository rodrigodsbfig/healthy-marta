/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_aiAssist from "../functions/aiAssist.js";
import type * as functions_importRecipe from "../functions/importRecipe.js";
import type * as functions_library from "../functions/library.js";
import type * as functions_mealPlans from "../functions/mealPlans.js";
import type * as functions_nutritionLogs from "../functions/nutritionLogs.js";
import type * as functions_pantry from "../functions/pantry.js";
import type * as functions_prepSessions from "../functions/prepSessions.js";
import type * as functions_recipes from "../functions/recipes.js";
import type * as functions_shoppingLists from "../functions/shoppingLists.js";
import type * as lib_foodMacros from "../lib/foodMacros.js";
import type * as lib_generateWeek from "../lib/generateWeek.js";
import type * as lib_plan from "../lib/plan.js";
import type * as lib_recipeLibrary from "../lib/recipeLibrary.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/aiAssist": typeof functions_aiAssist;
  "functions/importRecipe": typeof functions_importRecipe;
  "functions/library": typeof functions_library;
  "functions/mealPlans": typeof functions_mealPlans;
  "functions/nutritionLogs": typeof functions_nutritionLogs;
  "functions/pantry": typeof functions_pantry;
  "functions/prepSessions": typeof functions_prepSessions;
  "functions/recipes": typeof functions_recipes;
  "functions/shoppingLists": typeof functions_shoppingLists;
  "lib/foodMacros": typeof lib_foodMacros;
  "lib/generateWeek": typeof lib_generateWeek;
  "lib/plan": typeof lib_plan;
  "lib/recipeLibrary": typeof lib_recipeLibrary;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
