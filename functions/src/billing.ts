export const BMK_COSTS = { SOCIAL_BURST: 10 } as const;
export async function deductBmkCredits(_userId:string, _amount:number){
  try{
    // TODO: implement real transactional deduction
    return true;
  }catch(error){
    const msg = (error instanceof Error) ? error.message : String(error);
    console.error(`Transaction failed for user ${_userId}:`, msg);
    return false;
  }
}
