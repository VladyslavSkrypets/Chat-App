const validate = ({ isAuth, values, errors }) => {
  const rules = {
    email: (value) => {
      if (!value) {
        errors.email = 'Введите email адрес';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        // todo: regexps should be moved to consts and commented
        errors.email = 'Неверный email!';
      }
    },

    password: (value) => {
      if (!value) {
        errors.password = 'Введите пароль';
      } else if (
        !isAuth &&
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/i.test(value)
      ) {
        errors.password = 'Слишком лёгкий пароль!';
      }
    },

    phone: (value) => {
      if (!value) {
        errors.phone = 'Введите ваш телефон';
      } else if (!/^[0-9\-+]{9,15}$/i.test(value)) {
        errors.phone = 'Неверный номер телефона!';
      }
    },

    confirm__password: (value) => {
      if (!value) {
        errors.confirm__password = 'Подтвердите пароль';
      } else if (values.password !== value) {
        errors.confirm__password = 'Пароли не совпадают!';
      }
    },

    userfullname: (value) => {
      if (!value) {
        errors.userfullname = 'Введите ваше имя';
      }
    },

    username: (value) => {
      if (!value) {
        errors.username = 'Введите никнейм';
      }
    },
  };

  // todo: optional chaining?
  Object.keys(values).forEach((key) => rules[key] && rules[key](values[key]));
};

export default validate;
