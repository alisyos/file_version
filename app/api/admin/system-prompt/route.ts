import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const promptPath = path.join(process.cwd(), 'lib', 'systemPrompt.json');

// GET: 현재 프롬프트 데이터 조회
export async function GET() {
  try {
    const promptData = JSON.parse(fs.readFileSync(promptPath, 'utf-8'));
    return NextResponse.json(promptData);
  } catch (error) {
    console.error('프롬프트 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '프롬프트 데이터를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 프롬프트 데이터 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { systemPrompt, mainPrompt } = await request.json();
    
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return NextResponse.json(
        { error: '유효한 시스템 프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!mainPrompt || typeof mainPrompt !== 'string') {
      return NextResponse.json(
        { error: '유효한 메인 프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    const updatedData = {
      systemPrompt: systemPrompt.trim(),
      mainPrompt: mainPrompt.trim(),
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(promptPath, JSON.stringify(updatedData, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      message: '프롬프트가 성공적으로 업데이트되었습니다.',
      ...updatedData
    });
  } catch (error) {
    console.error('프롬프트 업데이트 오류:', error);
    return NextResponse.json(
      { error: '프롬프트를 업데이트할 수 없습니다.' },
      { status: 500 }
    );
  }
} 