import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { IngredientDetailPage } from './pages/IngredientDetailPage';
import { ToolsPage } from './pages/ToolsPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { RecipeEditorPage } from './pages/admin/RecipeEditorPage';
import { IngredientEditorPage } from './pages/admin/IngredientEditorPage';

/**
 * Mapa de rutas del sitio.
 *
 * Las rutas públicas son la experiencia de lectura; `/administracion` queda
 * separada en su propio armazón para no mezclar la edición con la consulta.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />

        <Route path="recetas">
          <Route index element={<LibraryPage />} />
          <Route path=":slug" element={<RecipeDetailPage />} />
        </Route>

        <Route path="ingredientes">
          <Route index element={<IngredientsPage />} />
          <Route path=":slug" element={<IngredientDetailPage />} />
        </Route>

        <Route path="utensilios" element={<ToolsPage />} />
        <Route path="compras" element={<ShoppingPage />} />
        <Route path="favoritos" element={<FavoritesPage />} />

        <Route path="administracion" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="recetas/nueva" element={<RecipeEditorPage />} />
          <Route path="recetas/:id/editar" element={<RecipeEditorPage />} />
          <Route path="ingredientes/nuevo" element={<IngredientEditorPage />} />
          <Route path="ingredientes/:id/editar" element={<IngredientEditorPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
