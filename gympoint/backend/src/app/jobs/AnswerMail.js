import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'answerMail';
  }

  async handle({ data }) {
    const { student, helpOrder, answer } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Resposta para a sua dúvida!',
      template: 'answer',
      context: {
        student: student.name,
        question: helpOrder.question,
        answer,
      },
    });
  }
}

export default new AnswerMail();
