/*
    Supabase
        데이터베이스의 `테이블`로 관리해야 함
        로그인 -> 로그인에 대한 정보 -> 내가 관리하는 데이터베이스의 테이블로 넣어야 함
        Next Step
        소셜 로그인을 하면 자동으로 profiles 테이블에 로그인한 사용자의 정보가 들어가게 할 것


    - 소셜 로그인 연동

    1. github developer Settings에서 OAuth Apps 생성
    2. supabase 생성 후 Auth Providers에서 깃허브의 callback url 복사
    3. 복사한 callback url을 것허브 oauth apps에 넣음
    4. 깃허브의 oauth app에서 client ID와 client Secret키를 supabase에 넣음
    5. 이후 docs를 보고 사용
        1. connect를 누르고 App Framework 에서 framework 리액트 using vite

    - DB
        Primary 체크:
            모든 테이블은 하나의 기본값을 가지고 있어야한다.

        Is Nullable 체크 해제:
            널을 비허용 하겠다.
  
        Foreign keys:
            내가 만든 테이블이 다른 외부 테이블과 어떻게 연결되어있는가?
                schema:  auth
                table to reference to: users
            public.profiles의 id와, auth.users의 id가 연결되어있다.

            public.profiles 테이블의 모든 레코드(행)가 반드시 
            auth.users 테이블에 존재하는 사용자와 연결되어 있어야 함을 의미합니다.

    - function
        create new function ->
        Name of function: create_user_on_signup
        Return type : trigger
        Definition : 실행함수 (The language below should be written in plpgsql)

        수파 베이스에 활용할 수 있는 함수!

        -> 이후 SQL Editor에서
            create trigger create_user_on_signup after
            insert on auth.users for each row 
            execute function create_user_on_signup ();

        실행하면, Triggers의 auth 스키마에 create_user_on_signup 함수가
        들어가있음

        -> 다시 SQL Editor에서
            GRANT ALL PRIVILEGES ON TABLE public.profiles TO supabase_auth_admin
        실행하면 권한 부여가 완료됨.

위 과정으로 소셜 로그인 기본 정보 완성

소셜 로그인 재확인 위해 테이블에서 로그인 데이터 지웠더니, 로그인 확인 창이 다시
나타나지 않고, 메인화면으로 이동하고 데이터도 안쌓임 -> 권한 에러
이를 해결하기 위해서 -> 프로필 테이블에 insert하기위해 Polices에 정책 등록

펑션
폴리시


---
10.01

프로필 영역은 profiles
포스트 개수는 posts

About 자기소개 영역은? 새로 만들어야함
bio 컬럼을 profoles 테이블에 추가 > 모든 사용자의 정보에 bio 컬럼이 NULL으로 추가됨


- 깃허브 로그인
    options에서 redirectTO 속성을 적용하면, 로그인 이후 페이지를 지정 가능
        ㄴ redirectTo: `${import.meta.env.VITE_URL}/profile-setup`, 속성을 추가
        ㄴ .env 파일에서 VITE_URL=http://localhost:5173 를 설정하였기 때문에,
            5173포트로 실행하지 않으면 깃허브 로그인이 작동하지 않는다.
    소셜 로그인은 인증을 소셜측에서 진행해서 편하지만, 회원가입 할 때 우리가 필요한 어떠한
    정보들은 가져오지 못한다. 따라서 별도로 프로필을 완성하는 페이지로 연결

    - getClaims()
    클레임을 가져오는 메서드
    ㄴ user라는 속성에 들어있는 여러 속성같은 것
    ㄴ 근데 필요없는 정보도 같이 가져온다..
    ㄴ 하지만 supabase는 이런 짜투리 정보를 자동으로 제거해주는 JwtPayload 타입이 있음

    d.ts 파일은 글로벌하게 적용되지만,
    import가 되어있을 경우, 글로벌로 적용되지 않는다.
    import type { Claims } from "../../types/user"; 필요

    TS기반 프로젝트 할 때,
    generating Types를 다운로드해서 옮겨줘야
    any로 추론이 되지 않는다.
    이름이 supabase.ts인데, 이전 utils에 만든 파일과 이름이 같으니
    database.d.ts로 이름을 변경한다.
    이후 기존 supabase.ts에서
        ㄴ import type { Database } from "../types/database";
        ㄴ const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    enable select for public profiles
    를 해서 policy에 셀렉트에 대한 권한 추가가 필요

    로그인->깃허브로그인->로그인(리다이렉트) 여기서 바이오 값 있는지 없는지 판단 ->
    있으면? 메인페이지, 없으면? 프로필 셋업페이지
    이게 깜빡거림도 없고, 깔끔한 로그인 흐름

*/
