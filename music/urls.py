from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('home/', views.home_view, name='home'),
    path('', views.index_view, name='index'),
    path('song/<int:song_id>/', views.play_song, name='play_song'),
    path('song/<int:song_id>/rate/', views.rate_song, name='rate_song'),
    
    path('playlist/', views.playlist, name='playlist'),
    path('playlist/create/', views.create_playlist, name='create_playlist'),
    path('playlist/<int:playlist_id>/', views.view_playlist, name='view_playlist'),
    path('playlist/<int:playlist_id>/add/<int:song_id>/', views.add_to_playlist, name='add_to_playlist'),
    path('playlist/<int:playlist_id>/remove/<int:song_id>/', views.remove_from_playlist, name='remove_from_playlist'),
    path('playlist/<int:playlist_id>/delete/', views.delete_playlist, name='delete_playlist'),
    path('add_to_playlist_dropdown/', views.add_to_playlist_dropdown, name='add_to_playlist_dropdown'),

    path('artist/<int:artist_id>/', views.artist_detail, name='artist_detail'),

    path('search/', views.search_view, name='search'),
    
    path("favorites/", views.favorite_songs, name="favorite_songs"),
    path('favorite/add/<int:song_id>/', views.add_favorite, name='add_favorite'),
    path('favorite/remove/<int:song_id>/', views.remove_favorite, name='remove_favorite'),
    path('favorite/remove_home/<int:song_id>/', views.remove_favorite_home, name='remove_favorite_home'),

    path('upload/', views.upload_song, name='upload_song'),

]