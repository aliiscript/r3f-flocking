uniform float time;
uniform float delta;
uniform vec2 uResolution;
uniform sampler2D texturePosition;

void main()	{

	vec2 uv = gl_FragCoord.xy / uResolution.xy;
	vec4 tmpPos = texture2D( texturePosition, uv );
	vec3 position = tmpPos.xyz;

	gl_FragColor = vec4( position + vec3(.001) , 1.0 );

}