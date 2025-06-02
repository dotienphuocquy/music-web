from django import forms
from .models import Song

class SongUploadForm(forms.ModelForm):
    class Meta:
        model = Song
        fields = ['title', 'artist', 'genre', 'audio', 'image']
