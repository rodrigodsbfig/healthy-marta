import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Today } from '@/pages/Today'
import { MealPlan } from '@/pages/MealPlan'
import { Recipes } from '@/pages/Recipes'
import { RecipeDetail } from '@/pages/RecipeDetail'
import { ShoppingList } from '@/pages/ShoppingList'
import { Workouts } from '@/pages/Workouts'
import { Settings } from '@/pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="meal-plan" element={<MealPlan />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/:id" element={<RecipeDetail />} />
        <Route path="shopping-list" element={<ShoppingList />} />
        <Route path="workouts" element={<Workouts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
