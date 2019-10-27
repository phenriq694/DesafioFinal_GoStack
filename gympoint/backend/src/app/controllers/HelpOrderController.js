import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
    });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { helpOrder_id } = req.params;
    const { answer } = req.body;

    /**
     * Check if the help order exists
     */
    const helpOrder = await HelpOrder.findByPk(helpOrder_id);

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order cannot be found' });
    }

    const gymAnswer = await helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    const student = await Student.findByPk(helpOrder.student_id);

    await Queue.add(AnswerMail.key, {
      student,
      helpOrder,
      answer,
    });

    return res.json(gymAnswer);
  }
}

export default new HelpOrderController();
