import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const weights = await db.factorWeight.findFirst();
    if (!weights) {
      return NextResponse.json({ error: 'No weights found' }, { status: 404 });
    }
    return NextResponse.json({ weights });
  } catch (error) {
    console.error('Error fetching weights:', error);
    return NextResponse.json({ error: 'Failed to fetch weights' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      revenueGrowth, marketOpportunity, competitiveMoat, profitabilityPath,
      valuation, executionCapabilities, innovationCulture,
      fundingStrength, customerStickiness, monetizationModel,
    } = body;

    const total = revenueGrowth + marketOpportunity + competitiveMoat + profitabilityPath +
      valuation + executionCapabilities + innovationCulture +
      fundingStrength + customerStickiness + monetizationModel;
    if (Math.abs(total - 1.0) > 0.01) {
      return NextResponse.json({ error: `Weights must sum to 1.0, got ${total.toFixed(2)}` }, { status: 400 });
    }

    const existingWeights = await db.factorWeight.findFirst();
    let weights;

    const weightData = {
      revenueGrowth, marketOpportunity, competitiveMoat, profitabilityPath,
      valuation, executionCapabilities, innovationCulture,
      fundingStrength, customerStickiness, monetizationModel,
    };

    if (existingWeights) {
      weights = await db.factorWeight.update({
        where: { id: existingWeights.id },
        data: weightData,
      });
    } else {
      weights = await db.factorWeight.create({ data: weightData });
    }

    const stocks = await db.stock.findMany();
    for (const stock of stocks) {
      const fiveXScore = Math.round(
        stock.revenueGrowth * revenueGrowth +
        stock.marketOpportunity * marketOpportunity +
        stock.competitiveMoat * competitiveMoat +
        stock.profitabilityPath * profitabilityPath +
        stock.valuation * valuation +
        stock.executionCapabilities * executionCapabilities +
        stock.innovationCulture * innovationCulture +
        stock.fundingStrength * fundingStrength +
        stock.customerStickiness * customerStickiness +
        stock.monetizationModel * monetizationModel
      );

      await db.stock.update({
        where: { id: stock.id },
        data: { fiveXScore },
      });
    }

    return NextResponse.json({ weights, message: 'Weights updated and scores recalculated' });
  } catch (error) {
    console.error('Error updating weights:', error);
    return NextResponse.json({ error: 'Failed to update weights' }, { status: 500 });
  }
}
