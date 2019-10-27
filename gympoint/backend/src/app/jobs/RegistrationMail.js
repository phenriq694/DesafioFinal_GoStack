import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'registrationMail';
  }

  async handle({ data }) {
    const { studentExists, planExists, endDate, planPrice } = data;

    await Mail.sendMail({
      to: `${studentExists.name} <${studentExists.email}>`,
      subject: 'Matrícula efetuada com sucesso!',
      template: 'registration',
      context: {
        student: studentExists.name,
        end_date: format(parseISO(endDate), "dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        plan: planExists.title,
        price: planPrice,
      },
    });
  }
}

export default new RegistrationMail();
