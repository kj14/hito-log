import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  PROFILE_COOKIE,
  DashboardPayload,
  fetchDashboard,
  saveDashboard,
} from '../../../lib/dashboard-storage';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function GET() {
  const cookieStore = cookies();
  const profileToken = cookieStore.get(PROFILE_COOKIE)?.value;

  try {
    const dashboard = await fetchDashboard(profileToken);

    if (!profileToken || profileToken !== dashboard.profileToken) {
      cookieStore.set({
        name: PROFILE_COOKIE,
        value: dashboard.profileToken,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: ONE_YEAR_SECONDS,
        path: '/',
      });
    }

    return NextResponse.json({
      profileId: dashboard.profileId,
      profile: dashboard.profile,
      relationships: dashboard.relationships,
      goals: dashboard.goals,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard', error);
    return NextResponse.json({ message: 'ダッシュボードの取得に失敗しました。' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  let profileToken = cookieStore.get(PROFILE_COOKIE)?.value;

  try {
    const body = (await request.json()) as DashboardPayload;

    if (!profileToken) {
      const dashboard = await fetchDashboard();
      profileToken = dashboard.profileToken;
      cookieStore.set({
        name: PROFILE_COOKIE,
        value: profileToken,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: ONE_YEAR_SECONDS,
        path: '/',
      });
      body.profileId = dashboard.profileId;
    }

    const saved = await saveDashboard(profileToken, body);

    return NextResponse.json({
      profileId: saved.profileId,
      profile: saved.profile,
      relationships: saved.relationships,
      goals: saved.goals,
    });
  } catch (error) {
    console.error('Failed to save dashboard', error);
    return NextResponse.json({ message: 'ダッシュボードの保存に失敗しました。' }, { status: 500 });
  }
}
