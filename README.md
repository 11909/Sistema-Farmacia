¡Bienvenido! Este espacio contiene la documentación sobre el diseño y la arquitectura de nuestra base de datos.

## 📊 Diagramas

Para comprender mejor la estructura de los datos, hemos elaborado los diagramas correspondientes. Estos archivos están alojados de forma segura en Google Drive.

> **¿Qué encontrarás en la carpeta?**
> * 🟥 **Diagrama Entidad-Relación (ER):** Representación conceptual de las entidades principales, sus atributos y cómo interactúan entre sí.
> * 🟦 **Diagrama Relacional:** Esquema lógico que detalla las tablas, claves primarias (PK), claves foráneas (FK) y la cardinalidad.

### 🔗 Enlaces de Acceso

Puedes visualizar o descargar los diagramas haciendo clic en el siguiente botón:

[![Ver Diagramas en Google Drive](https://img.shields.io/badge/Google_Drive-Ver_Diagramas-1FA463?style=for-the-badge&logo=google-drive&logoColor=white)](https://drive.google.com/drive/folders/1v4Vulffj4aQeYwzxmdoUk1hXxvC3nWfI)

---
*💡 **Nota:** Si tienes problemas para visualizar los archivos, asegúrate de haber iniciado sesión con tu cuenta de Google o solicita acceso al administrador del proyecto.*
"""

with open("README.md", "w", encoding="utf-8") as f:
    f.write(content)

print("File generated successfully.")
