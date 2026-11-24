import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  SEED_INGREDIENTS,
  SEED_RECIPES,
  SEED_SHOPPING,
} from '../data/seed';
import type { Ingredient, Recipe, ShoppingItem } from '../domain/types';
import {
  clearState,
  loadState,
  saveState,
  STORAGE_LABELS,
  type StorageStatus,
} from './storage';

interface AppState {
  recipes: Recipe[];
  ingredients: Ingredient[];
  shopping: ShoppingItem[];
  favorites: string[];
  storage: StorageStatus;
}

type Action =
  | { type: 'toggleFavorite'; id: string }
  | { type: 'toggleShopping'; id: string }
  | { type: 'addShopping'; item: ShoppingItem }
  | { type: 'updateShopping'; id: string; patch: Partial<ShoppingItem> }
  | { type: 'removeShopping'; id: string }
  | { type: 'upsertRecipe'; recipe: Recipe }
  | { type: 'deleteRecipe'; id: string }
  | { type: 'toggleFeatured'; id: string }
  | { type: 'upsertIngredient'; ingredient: Ingredient }
  | { type: 'deleteIngredient'; id: string }
  | { type: 'reset' };

const initialState: AppState = {
  recipes: SEED_RECIPES,
  ingredients: SEED_INGREDIENTS,
  shopping: SEED_SHOPPING,
  favorites: [],
  storage: 'ok',
};

function upsert<T extends { id: string }>(list: T[], entity: T): T[] {
  const index = list.findIndex((item) => item.id === entity.id);
  if (index === -1) return [...list, entity];
  const next = [...list];
  next[index] = entity;
  return next;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'toggleFavorite':
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };

    case 'toggleShopping':
      return {
        ...state,
        shopping: state.shopping.map((item) =>
          item.id === action.id ? { ...item, checked: !item.checked } : item,
        ),
      };

    case 'addShopping':
      return { ...state, shopping: [...state.shopping, action.item] };

    case 'updateShopping':
      return {
        ...state,
        shopping: state.shopping.map((item) =>
          item.id === action.id ? { ...item, ...action.patch } : item,
        ),
      };

    case 'removeShopping':
      return { ...state, shopping: state.shopping.filter((item) => item.id !== action.id) };

    case 'upsertRecipe':
      return { ...state, recipes: upsert(state.recipes, action.recipe) };

    case 'deleteRecipe':
      return {
        ...state,
        recipes: state.recipes.filter((recipe) => recipe.id !== action.id),
        favorites: state.favorites.filter((id) => id !== action.id),
      };

    case 'toggleFeatured':
      return {
        ...state,
        recipes: state.recipes.map((recipe) =>
          recipe.id === action.id ? { ...recipe, featured: !recipe.featured } : recipe,
        ),
      };

    case 'upsertIngredient':
      return { ...state, ingredients: upsert(state.ingredients, action.ingredient) };

    case 'deleteIngredient':
      return { ...state, ingredients: state.ingredients.filter((i) => i.id !== action.id) };

    case 'reset':
      return initialState;

    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  dispatch: React.Dispatch<Action>;
  /** Restablece el contenido del archivo original y borra lo guardado. */
  resetAll: () => void;
  storageLabel: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // La lectura de LocalStorage ocurre en el primer render: así los formularios
  // que arrancan con una entidad guardada nunca la ven como inexistente.
  const [bootstrap] = useState(loadState);
  const [state, dispatch] = useReducer(reducer, initialState, (base) =>
    bootstrap.state
      ? {
          ...base,
          recipes: bootstrap.state.recipes,
          ingredients: bootstrap.state.ingredients,
          shopping: bootstrap.state.shopping,
          favorites: bootstrap.state.favorites,
        }
      : base,
  );
  const [storage, setStorage] = useState<StorageStatus>(bootstrap.status);
  const skipFirstSave = useRef(true);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const status = saveState({
      recipes: state.recipes,
      ingredients: state.ingredients,
      shopping: state.shopping,
      favorites: state.favorites,
    });
    setStorage((current) => (current === status ? current : status));
  }, [state.recipes, state.ingredients, state.shopping, state.favorites]);

  const resetAll = useCallback(() => {
    clearState();
    skipFirstSave.current = true;
    dispatch({ type: 'reset' });
    setStorage('ok');
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ ...state, dispatch, resetAll, storageLabel: STORAGE_LABELS[storage] }),
    [state, resetAll, storage],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return context;
}
