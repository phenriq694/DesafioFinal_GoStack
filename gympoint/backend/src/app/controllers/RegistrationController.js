import * as Yup from 'yup';
import { parseISO, endOfDay, addMonths, isBefore } from 'date-fns';

import Student from '../models/Student';
import Plan from '../models/Plan';
import Registration from '../models/Registration';
import Queue from '../../lib/Queue';
import RegistrationMail from '../jobs/RegistrationMail';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      order: ['start_date'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Check if the student exists
     */
    const studentExists = await Student.findByPk(student_id);

    if (!studentExists) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    /**
     * Check if the plan exists
     */
    const planExists = await Plan.findByPk(plan_id);

    if (!planExists) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    /**
     * Check if the start date is not earlier than the current date.
     */
    const startDate = parseISO(start_date);
    const currentDate = new Date();

    if (isBefore(endOfDay(startDate), currentDate)) {
      return res.status(400).json({ error: 'Date is not valid' });
    }

    const endDate = addMonths(startDate, planExists.duration);

    const planPrice = planExists.duration * planExists.price;

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
      price: planPrice,
    });

    await Queue.add(RegistrationMail.key, {
      studentExists,
      planExists,
      endDate,
      planPrice,
    });

    return res.json(registration);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check if the registration exists
     */
    const registration = await Registration.findByPk(
      req.params.registration_id
    );

    if (!registration) {
      return res.status(400).json({ error: 'Registration does not exist' });
    }

    const { plan_id, start_date } = req.body;

    /**
     * Check if the plan exists
     */
    const planExists = await Plan.findByPk(plan_id || registration.plan_id);

    if (!planExists) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    /**
     * Check if the start date is not earlier than the current date.
     */
    const startDate = parseISO(start_date);
    const currentDate = new Date();

    if (isBefore(endOfDay(startDate), currentDate)) {
      return res.status(400).json({ error: 'Date is not valid' });
    }

    const endDate = addMonths(startDate, planExists.duration);

    const planPrice = planExists.duration * planExists.price;

    await registration.update({
      plan_id,
      start_date,
      end_date: endDate,
      price: planPrice,
    });

    return res.json(registration);
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(
      req.params.registration_id
    );

    if (!registration) {
      return res.status(400).json({ error: 'Registration cannot be found' });
    }

    await registration.destroy();

    return res.json(registration);
  }
}

export default new RegistrationController();
