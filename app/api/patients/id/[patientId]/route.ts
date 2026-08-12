import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma-client';
import { format } from 'date-fns';

/**
 * Fetch a patient by their UUID (patient id).
 * The admin patient detail page navigates to /admin/patients/{patientId} where
 * patientId is the internal UUID, not the 5-character MRN. This endpoint resolves
 * that UUID and returns the patient in the format the detail page expects.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        Hospital: { select: { id: true, name: true, subdomain: true } },
        User: { select: { id: true, name: true, email: true } },
        ProfilePicture: { select: { imageUrl: true } },
        Emails: { orderBy: { createdAt: 'asc' } },
        Phones: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const email = patient.Emails && patient.Emails.length > 0 ? patient.Emails[0].email : patient.User?.email || null;
    const phoneNumber =
      patient.Phones && patient.Phones.length > 0 ? patient.Phones[0].phone : null;

    return NextResponse.json({
      id: patient.id,
      mrn: patient.mrn,
      medicalNumber: patient.mrn,
      name: patient.User?.name || patient.name,
      gender: patient.gender || null,
      birthDate: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString() : null,
      email,
      phoneNumber,
      address: null,
      hospitalId: patient.hospitalId || null,
      hospital: patient.Hospital
        ? { id: patient.Hospital.id, name: patient.Hospital.name, subdomain: patient.Hospital.subdomain }
        : null,
      qrCode: patient.qrCode || null,
      note: patient.note || null,
      onboardingCompleted: patient.onboardingCompleted,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
      profilePicture: patient.ProfilePicture?.imageUrl || null,
    });
  } catch (error) {
    console.error('Error fetching patient by ID:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve patient data' },
      { status: 500 }
    );
  }
}