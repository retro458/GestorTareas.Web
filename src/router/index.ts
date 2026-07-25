import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/types'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { soloInvitados: true } // si ya esta logueado, no puede volver aqui
  },
  {
    path: '/jefe',
    name: 'jefe-dashboard',
    component: () => import('@/views/JefeDashboardView.vue'),
    meta: {
      requiereAuth: true,
      rolesPermitidos: [ROLES.JEFE, ROLES.ENCARGADO]
    }
  },
  {
    path: '/empleado',
    name: 'empleado-dashboard',
    component: () => import('@/views/EmpleadoDashboardView.vue'),
    meta: {
      requiereAuth: true,
      rolesPermitidos: [ROLES.EMPLEADO]
    }
  },
  {
    // Redireccion inicial segun rol, para que "/" lleve al dashboard correcto
    path: '/',
    redirect: () => {
      const auth = useAuthStore()
      if (!auth.estaAutenticado) return '/login'
      return auth.esJefeOEncargado ? '/jefe' : '/empleado'
    }
  },
  {
    // Catch-all: cualquier URL desconocida vuelve a la raiz (que decide segun rol)
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ============================================================
// Guard global: se ejecuta antes de cada navegacion.
// ============================================================
// Nota importante sobre la seguridad: estas guards son ayuda de UX
// (evitar mostrar pantallas a las que el usuario no puede acceder),
// no son la barrera de seguridad real. El backend sigue validando
// cada request con [Authorize(Roles=...)] independientemente de que
// el frontend deje o no ver la ruta. 
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  // Ruta solo para invitados (login)
  if (to.meta.soloInvitados && auth.estaAutenticado) {
    return next(auth.esJefeOEncargado ? '/jefe' : '/empleado')
  }

  // Ruta que requiere autenticacion pero no hay usuario -> al login
  if (to.meta.requiereAuth && !auth.estaAutenticado) {
    return next('/login')
  }

  // Ruta con restriccion de roles
  const rolesPermitidos = to.meta.rolesPermitidos as string[] | undefined
  if (rolesPermitidos && auth.usuario) {
    if (!rolesPermitidos.includes(auth.usuario.rol)) {
      // Usuario logueado pero rol incorrecto -> mandalo a su propio dashboard
      return next(auth.esJefeOEncargado ? '/jefe' : '/empleado')
    }
  }

  next()
})

export default router