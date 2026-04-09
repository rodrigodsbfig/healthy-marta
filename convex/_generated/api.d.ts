/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_importRecipe from "../functions/importRecipe.js";
import type * as functions_mealPlans from "../functions/mealPlans.js";
import type * as functions_nutritionLogs from "../functions/nutritionLogs.js";
import type * as functions_prepSessions from "../functions/prepSessions.js";
import type * as functions_recipes from "../functions/recipes.js";
import type * as functions_shoppingLists from "../functions/shoppingLists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/importRecipe": typeof functions_importRecipe;
  "functions/mealPlans": typeof functions_mealPlans;
  "functions/nutritionLogs": typeof functions_nutritionLogs;
  "functions/prepSessions": typeof functions_prepSessions;
  "functions/recipes": typeof functions_recipes;
  "functions/shoppingLists": typeof functions_shoppingLists;
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
