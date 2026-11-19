from django.core.management.base import BaseCommand
from inventario.models import Categoria, Proveedor, Producto

class Command(BaseCommand):
    help = 'Pobla la base de datos con registros iniciales de Categorías, Proveedores y Productos'

    def handle(self, *args, **kwargs):
        self.stdout.write("Limpiando datos antiguos...")
        # Se eliminan los datos en orden para respetar la integridad referencial
        Producto.objects.all().delete()
        Proveedor.objects.all().delete()
        Categoria.objects.all().delete()

        self.stdout.write("Creando categorías iniciales...")
        cat_computo = Categoria.objects.create(
            nombre="Computación y Servidores",
            descripcion="Equipos portátiles, desktops y componentes de servidor",
            activo=True
        )
        cat_perifericos = Categoria.objects.create(
            nombre="Periféricos y Redes",
            descripcion="Teclados, mouse, monitores y switches de red",
            activo=True
        )
        cat_audio = Categoria.objects.create(
            nombre="Audio y Multimedia",
            descripcion="Audífonos profesionales, micrófonos y cámaras web",
            activo=True
        )

        self.stdout.write("Creando proveedores iniciales...")
        prov_tech = Proveedor.objects.create(
            nombre="TechDistribuidora Chile SpA",
            contacto="María González",
            telefono="+56 9 8765 4321",
            email="contacto@techdistro.cl"
        )
        prov_global = Proveedor.objects.create(
            nombre="Importadora Global Limitada",
            contacto="Carlos Pérez",
            telefono="+56 9 1234 5678",
            email="ventas@importadoraglobal.cl"
        )

        self.stdout.write("Creando productos con relaciones foráneas...")
        Producto.objects.create(
            codigo="SKU-NB-001",
            nombre="Notebook Lenovo ThinkPad E14",
            descripcion="Intel Core i5 16GB RAM 512GB SSD Pantalla 14 pulgadas",
            precio=649990.00,
            stock=15,
            categoria=cat_computo,
            proveedor=prov_tech
        )

        Producto.objects.create(
            codigo="SKU-MN-002",
            nombre="Monitor Dell 27 Pulgadas 4K",
            descripcion="Panel IPS resolución 3840x2160 conexión USB-C y HDMI",
            precio=329990.00,
            stock=20,
            categoria=cat_perifericos,
            proveedor=prov_global
        )

        Producto.objects.create(
            codigo="SKU-KB-003",
            nombre="Teclado Mecánico Keychron K2",
            descripcion="Inalámbrico Bluetooth switches Gateron Brown formato 75%",
            precio=89990.00,
            stock=35,
            categoria=cat_perifericos,
            proveedor=prov_tech
        )

        Producto.objects.create(
            codigo="SKU-AU-004",
            nombre="Audífonos Sony WH-1000XM5",
            descripcion="Cancelación de ruido activa inalámbricos batería 30 horas",
            precio=279990.00,
            stock=12,
            categoria=cat_audio,
            proveedor=prov_global
        )

        self.stdout.write(self.style.SUCCESS("¡Éxito! Base de datos poblada con 3 categorías, 2 proveedores y 4 productos."))