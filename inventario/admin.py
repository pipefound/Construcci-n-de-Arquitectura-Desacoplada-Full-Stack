from django.contrib import admin
from .models import Categoria, Proveedor, Producto

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'activo', 'creado_en')
    search_fields = ('nombre',)
    list_filter = ('activo',)

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'contacto', 'telefono', 'email')
    search_fields = ('nombre', 'contacto', 'email')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'categoria', 'proveedor', 'precio', 'stock', 'creado_en')
    search_fields = ('codigo', 'nombre')
    list_filter = ('categoria', 'proveedor')