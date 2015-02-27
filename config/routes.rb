Rails.application.routes.draw do
  root to: 'home#index'

  get '/share/:id' => 'home#share', as: :share_board
  get '/auth/twitter/callback' => 'sessions#create'
  get '/auth/failure' => 'sessions#failure'
  get '/signout' => 'sessions#destroy', as: :signout

  resources :boards, except: [:new, :edit, :show] do
    resources :stickies, except: [:new, :edit, :show]
    resources :collaborators, only: [:create, :destroy]
  end
end
