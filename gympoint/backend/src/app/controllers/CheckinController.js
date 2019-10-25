import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckintController {
  async index(req, res) {
    const checkins = await Checkin.findAll();

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

    return res.json();
  }
}

export default new CheckintController();
