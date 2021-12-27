import { withFormik } from 'formik';
import RegisterForm from '../components/RegisterForm';
import validateFunc from '../../../utils/validate';
import { userActions } from '../../../redux/actions';

import store from '../../../redux/store';

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: () => ({
    email: '',
    password: '',
    username: '',
    userfullname: '',
    phone: '',
    confirm__password: '',
  }),
  validate: (values) => {
    let errors = {};
    validateFunc({ isAuth: false, values, errors });
    return errors;
  },

  handleSubmit: (values, { setSubmitting, props }) => {
    store
      .dispatch(userActions.fetchUserRegister(values))
      .then(({ status }) => {
        if (status === 201) {
          setTimeout(() => {
            props.history.push('/');
          }, 1000);
        }
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  },

  displayName: 'RegisterForm',
})(RegisterForm);
