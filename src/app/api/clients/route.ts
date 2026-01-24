import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Client, { normalizePhoneNumber } from "@/lib/models/Client";

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    // Get the logged-in user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    
    // Validate required fields (salesRepName removed - auto-filled from logged-in user)
    const requiredFields = [
      "clientName",
      "companyName",
      "industry",
      "contactEmail",
      "contactPhone",
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(body.contactPhone);

    // Check if client with this phone already exists
    const existingClient = await Client.findOne({ contactPhone: normalizedPhone });
    if (existingClient) {
      return NextResponse.json(
        { error: "A client with this phone number already exists", existingClient },
        { status: 409 }
      );
    }

    // Generate client ID
    const clientId = await Client.generateClientId();

    // Get sales rep info from logged-in user
    const salesRepName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
    const salesRepEmail = user.emailAddresses[0]?.emailAddress || "";

    // Create the client
    const client = await Client.create({
      clientId,
      clientName: body.clientName,
      companyName: body.companyName,
      industry: body.industry,
      contactEmail: body.contactEmail,
      contactPhone: normalizedPhone,
      salesRepName,
      salesRepEmail,
      initialNotes: body.initialNotes || null,
      currentStatus: "prospect",
      totalCalls: 0,
    });

    console.log(`[API] Created new client: ${clientId} - ${body.clientName} (${body.companyName}) by ${salesRepName}`);

    return NextResponse.json(
      {
        message: "Client created successfully",
        client,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/clients error:", error);
    return NextResponse.json(
      { error: "Failed to create client", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/clients - List all clients or get by phone/id
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    // Get single client by phone
    if (phone) {
      const normalizedPhone = normalizePhoneNumber(phone);
      const client = await Client.findOne({ contactPhone: normalizedPhone });
      
      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ client });
    }

    // Get single client by ID
    if (clientId) {
      const client = await Client.findOne({ clientId });
      
      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ client });
    }

    // List all clients (with optional status filter)
    const query: Record<string, string> = {};
    if (status) {
      query.currentStatus = status;
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      clients,
      count: clients.length,
    });
  } catch (error) {
    console.error("[API] GET /api/clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PATCH /api/clients - Update a client
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    if (!body.clientId) {
      return NextResponse.json(
        { error: "Missing required field: clientId" },
        { status: 400 }
      );
    }

    const client = await Client.findOne({ clientId: body.clientId });
    
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      "clientName",
      "companyName",
      "industry",
      "contactEmail",
      "salesRepName",
      "initialNotes",
      "currentStatus",
    ];

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        (client as Record<string, unknown>)[field] = body[field];
      }
    }

    await client.save();

    console.log(`[API] Updated client: ${body.clientId}`);

    return NextResponse.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("[API] PATCH /api/clients error:", error);
    return NextResponse.json(
      { error: "Failed to update client", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
