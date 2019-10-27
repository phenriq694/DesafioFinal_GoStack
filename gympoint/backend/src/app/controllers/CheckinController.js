import { subDays } from 'date-fns';
import { Op } from 'sequelize';

import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckintController {
  async index(req, res) {
    const studentId = req.params.student_id;

    /**
     * Check if the student exists
     */
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student cannot be found' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
      },
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const studentId = req.params.student_id;

    /**
     * Check if the student exists
     */
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student cannot be found' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: { [Op.between]: [subDays(new Date(), 7), new Date()] },
      },
    });

    if (checkins.length >= 5) {
      return res
        .status(400)
        .json({ error: 'Student reached check limit per week!' });
    }

    const checkin = await Checkin.create({
      student_id: studentId,
    });

    return res.json(checkin);
  }
}

export default new CheckintController();
