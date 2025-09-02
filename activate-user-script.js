// Script para activar usuario ovicell manualmente
// Esto simula el proceso de validación de código

const activateUser = async () => {
  try {
    // Primero obtenemos los datos del usuario
    const response = await fetch('https://api.fixlytaller.com/api/admin/users', {
      headers: {
        'Authorization': 'Bearer admin123'
      }
    });
    
    const data = await response.json();
    console.log('Usuarios encontrados:', data.users.length);
    
    const ovicellUser = data.users.find(u => u.username === 'ovicell');
    if (ovicellUser) {
      console.log('Usuario ovicell encontrado:', ovicellUser);
    } else {
      console.log('Usuario ovicell no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

activateUser();