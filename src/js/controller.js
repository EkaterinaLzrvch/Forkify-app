// https://forkify-api.herokuapp.com/v2

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import AddRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SECONDS } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime'; //polyfiling async-await
// import { search } from 'core-js/fn/symbol';
import searchView from './views/searchView.js';
import { async } from 'regenerator-runtime';
import addRecipeView from './views/addRecipeView.js';

if (module.hot) {
  module.hot.accept();
}

const recipeContainer = document.querySelector('.recipe');

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    //0 results view to mark selected
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddbookmark = function () {
  // Add or remove
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update View
  recipeView.update(model.state.recipe);

  // Render the bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();

    //bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change ID in the URL without reloading (state, title, url)
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

//publisher-subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAdBookmark(controlAddbookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
