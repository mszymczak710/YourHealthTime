import { environment } from 'src/environments/environment';

export class Endpoints {
  static readonly baseUrl = environment.apiUrl;
  static readonly urls = Object.freeze({
    auth: {
      changePassword: '/auth/change-password/',
      forceLogout: '/auth/force-logout/',
      login: '/auth/login/',
      logout: '/auth/logout/',
      register: '/auth/register/',
      resetPassword: '/auth/reset-password/',
      resetPasswordConfirm: '/auth/reset-password-confirm/%s/%s/',
      token: {
        lifeTime: '/auth/token/lifetime/',
        refresh: '/auth/token/refresh'
      },
      userInfo: '/auth/user-info/',
      verifyEmail: '/auth/verify-email/%s/%s/'
    },
    dictionaries: {
      countries: '/dictionaries/countries/',
      diseases: '/dictionaries/diseases/',
      medicines: '/dictionaries/medicines/',
      offices: '/dictionaries/offices/',
      specializations: '/dictionaries/specializations/'
    },
    roles: {
      doctors: '/roles/doctors/',
      nurses: '/roles/nurses/',
      patients: '/roles/patients/'
    },
    treatment: {
      prescriptions: '/treatment/prescriptions/',
      visits: '/treatment/visits/'
    }
  });
}
