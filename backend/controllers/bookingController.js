import { 
  findOne, 
  find, 
  create, 
  update, 
  findByCondition 
} from '../config/database.js';
import { validateBookingRequest } from '../utils/validation.js';
import { sendNotification } from '../services/notificationService.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Patient)
export const createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      patientId: req.user.id
    };

    // Validate booking data
    const validation = validateBookingRequest(bookingData);
    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.errors.join(', '));
    }

    // Check if therapy exists
    const therapy = findOne('therapies', { id: bookingData.therapyId });
    if (!therapy) {
      res.status(404);
      throw new Error('Therapy not found');
    }

    // Check if practitioner exists
    const practitioner = findOne('users', { 
      id: bookingData.practitionerId, 
      role: 'practitioner' 
    });
    if (!practitioner) {
      res.status(404);
      throw new Error('Practitioner not found');
    }

    // Check for conflicts (simplified - in real app would check detailed scheduling)
    const existingBooking = findOne('bookings', {
      practitionerId: bookingData.practitionerId,
      scheduledDate: bookingData.preferredDate,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingBooking) {
      res.status(409);
      throw new Error('Time slot not available. Please choose a different time.');
    }

    // Create booking
    const newBooking = create('bookings', {
      patientId: req.user.id,
      practitionerId: bookingData.practitionerId,
      therapyId: bookingData.therapyId,
      scheduledDate: bookingData.preferredDate,
      scheduledTime: bookingData.preferredTime,
      duration: bookingData.duration || therapy.defaultDuration || 60,
      status: 'scheduled',
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send notification to practitioner
    await sendNotification({
      recipientId: practitioner.id,
      title: 'New Booking Request',
      message: `${req.user.firstName} ${req.user.lastName} has requested a ${therapy.name} session`,
      type: 'appointment',
      data: { bookingId: newBooking.id }
    });

    // Get full booking details with populated data
    const fullBooking = getBookingWithDetails(newBooking.id);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: fullBooking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    } else if (req.user.role === 'practitioner') {
      query.practitionerId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin can see all bookings
    }

    if (status) {
      query.status = status;
    }

    // Get bookings with pagination
    const allBookings = find('bookings', query);
    const startIndex = (page - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const bookings = allBookings.slice(startIndex, endIndex);

    // Get full booking details
    const bookingsWithDetails = bookings.map(booking => getBookingWithDetails(booking.id));

    res.json({
      success: true,
      data: {
        bookings: bookingsWithDetails,
        pagination: {
          total: allBookings.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(allBookings.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = findOne('bookings', { id: req.params.id });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && booking.patientId !== req.user.id ||
      req.user.role === 'practitioner' && booking.practitionerId !== req.user.id
    ) {
      if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied');
      }
    }

    const bookingWithDetails = getBookingWithDetails(booking.id);

    res.json({
      success: true,
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private (Practitioner/Admin)
export const updateBooking = async (req, res, next) => {
  try {
    const booking = findOne('bookings', { id: req.params.id });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization for practitioners
    if (req.user.role === 'practitioner' && booking.practitionerId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Prevent certain fields from being updated by non-admin users
    if (req.user.role !== 'admin') {
      delete updateData.patientId;
      delete updateData.practitionerId;
      delete updateData.therapyId;
    }

    const updatedBooking = update('bookings', req.params.id, updateData);
    const bookingWithDetails = getBookingWithDetails(updatedBooking.id);

    // Send notification if status changed
    if (req.body.status && req.body.status !== booking.status) {
      const patient = findOne('users', { id: booking.patientId });
      await sendNotification({
        recipientId: patient.id,
        title: 'Booking Updated',
        message: `Your booking status has been updated to: ${req.body.status}`,
        type: 'appointment',
        data: { bookingId: updatedBooking.id }
      });
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Patient/Practitioner/Admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = findOne('bookings', { id: req.params.id });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization
    if (
      req.user.role === 'patient' && booking.patientId !== req.user.id ||
      req.user.role === 'practitioner' && booking.practitionerId !== req.user.id
    ) {
      if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Access denied');
      }
    }

    // Can't cancel already completed or cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      res.status(400);
      throw new Error(`Cannot cancel ${booking.status} booking`);
    }

    const updatedBooking = update('bookings', req.params.id, {
      status: 'cancelled',
      cancellationReason: req.body.reason || 'No reason provided',
      cancelledBy: req.user.id,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send notification to the other party
    const notificationRecipient = req.user.role === 'patient' 
      ? booking.practitionerId 
      : booking.patientId;
    
    const notificationUser = findOne('users', { id: notificationRecipient });
    await sendNotification({
      recipientId: notificationRecipient,
      title: 'Booking Cancelled',
      message: `Booking has been cancelled by ${req.user.firstName} ${req.user.lastName}`,
      type: 'appointment',
      data: { bookingId: updatedBooking.id }
    });

    const bookingWithDetails = getBookingWithDetails(updatedBooking.id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Practitioner/Admin)
export const confirmBooking = async (req, res, next) => {
  try {
    const booking = findOne('bookings', { id: req.params.id });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Check authorization
    if (req.user.role === 'practitioner' && booking.practitionerId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    if (booking.status !== 'scheduled') {
      res.status(400);
      throw new Error('Only scheduled bookings can be confirmed');
    }

    const updatedBooking = update('bookings', req.params.id, {
      status: 'confirmed',
      confirmedBy: req.user.id,
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send confirmation notification to patient
    const patient = findOne('users', { id: booking.patientId });
    await sendNotification({
      recipientId: patient.id,
      title: 'Booking Confirmed',
      message: 'Your therapy session has been confirmed',
      type: 'appointment',
      data: { bookingId: updatedBooking.id }
    });

    const bookingWithDetails = getBookingWithDetails(updatedBooking.id);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (Patient)
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { newDate, newTime } = req.body;

    if (!newDate || !newTime) {
      res.status(400);
      throw new Error('New date and time are required');
    }

    const booking = findOne('bookings', { id: req.params.id });

    if (!booking) {
      res.status(404);
      throw new Error('Booking not found');
    }

    // Only patient can reschedule their own booking
    if (booking.patientId !== req.user.id) {
      res.status(403);
      throw new Error('Access denied');
    }

    // Can't reschedule completed or cancelled bookings
    if (['completed', 'cancelled'].includes(booking.status)) {
      res.status(400);
      throw new Error(`Cannot reschedule ${booking.status} booking`);
    }

    // Check for conflicts
    const conflictingBooking = findOne('bookings', {
      practitionerId: booking.practitionerId,
      scheduledDate: newDate,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflictingBooking && conflictingBooking.id !== booking.id) {
      res.status(409);
      throw new Error('Time slot not available. Please choose a different time.');
    }

    const updatedBooking = update('bookings', req.params.id, {
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'scheduled', // Reset to scheduled for practitioner to confirm
      rescheduledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Send notification to practitioner
    const practitioner = findOne('users', { id: booking.practitionerId });
    await sendNotification({
      recipientId: practitioner.id,
      title: 'Booking Rescheduled',
      message: `${req.user.firstName} ${req.user.lastName} has rescheduled their appointment`,
      type: 'appointment',
      data: { bookingId: updatedBooking.id }
    });

    const bookingWithDetails = getBookingWithDetails(updatedBooking.id);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: { booking: bookingWithDetails }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots for a practitioner
// @route   GET /api/bookings/available-slots/:practitionerId
// @access  Private (Patient)
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { practitionerId } = req.params;
    const { date } = req.query;

    if (!date) {
      res.status(400);
      throw new Error('Date is required');
    }

    // Check if practitioner exists
    const practitioner = findOne('users', { 
      id: practitionerId, 
      role: 'practitioner' 
    });

    if (!practitioner) {
      res.status(404);
      throw new Error('Practitioner not found');
    }

    // Get existing bookings for the date
    const existingBookings = find('bookings', {
      practitionerId: practitionerId,
      scheduledDate: date,
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    });

    // Generate available slots (simplified - in real app would use practitioner's schedule)
    const workingHours = {
      start: '09:00',
      end: '17:00',
      slotDuration: 60 // minutes
    };

    const availableSlots = generateAvailableSlots(workingHours, existingBookings);

    res.json({
      success: true,
      data: {
        practitionerId,
        date,
        availableSlots
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get booking with related data
const getBookingWithDetails = (bookingId) => {
  const booking = findOne('bookings', { id: bookingId });
  if (!booking) return null;

  const patient = findOne('users', { id: booking.patientId });
  const practitioner = findOne('users', { id: booking.practitionerId });
  const therapy = findOne('therapies', { id: booking.therapyId });

  return {
    ...booking,
    patient: patient ? {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone
    } : null,
    practitioner: practitioner ? {
      id: practitioner.id,
      firstName: practitioner.firstName,
      lastName: practitioner.lastName,
      email: practitioner.email,
      specialization: practitioner.specialization
    } : null,
    therapy: therapy ? {
      id: therapy.id,
      name: therapy.name,
      description: therapy.description,
      duration: therapy.defaultDuration,
      price: therapy.price
    } : null
  };
};

// Helper function to generate available time slots
const generateAvailableSlots = (workingHours, existingBookings) => {
  const slots = [];
  const start = new Date(`2000-01-01 ${workingHours.start}:00`);
  const end = new Date(`2000-01-01 ${workingHours.end}:00`);
  const slotDuration = workingHours.slotDuration * 60 * 1000; // Convert to milliseconds

  for (let time = start; time < end; time = new Date(time.getTime() + slotDuration)) {
    const timeString = time.toTimeString().slice(0, 5); // HH:MM format
    
    // Check if this slot is available
    const isBooked = existingBookings.some(booking => 
      booking.scheduledTime === timeString
    );

    if (!isBooked) {
      slots.push({
        time: timeString,
        available: true
      });
    }
  }

  return slots;
};